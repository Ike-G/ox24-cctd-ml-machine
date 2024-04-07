import ModelTrainer, { TrainingData } from '../domain/ModelTrainer';
import LayersMLModel from './LayersMLModel';
import * as tf from '@tensorflow/tfjs';

export type MoEModelTrainingSettings = {
  noOfEpochs: number;
  noOfUnits: number;
  validationSplit: number;
  learningRate: number;
  batchSize: number;
  numExperts: number;
  topK: number;
};

function applyGatingNetwork(
  input: tf.SymbolicTensor,
  numUnits: number,
  numExperts: number,
){
  const first = tf.layers.batchNormalization().apply(input);
  const second = tf.layers.dense({ units: numUnits, activation: 'relu' }).apply(first);
  return tf.layers
    //softmax to give probability distribution of which expert is the best choice
    .dense({ units: numExperts, activation: 'softmax' })
    .apply(second) as tf.Tensor<tf.Rank>
}

function applyExpertNetwork(
  input: tf.SymbolicTensor,
  numUnits: number,
  numberOfClasses: number,
){
  const first = tf.layers.batchNormalization().apply(input);
  const second = tf.layers.dense({ units: numUnits, activation: 'relu' }).apply(first);
  return tf.layers
    //don't want to put a softmax here else data travels through two softmaxes
    //and gets "smushed" between 0 and 1 twice
    .dense({ units: numberOfClasses, activation: 'relu' })
    .apply(second) as tf.Tensor<tf.Rank>//as tf.SymbolicTensor;
}

class GatingMultiplier extends tf.layers.Layer {
  constructor() {
    super({});
  }

  //no trainable weights in the layer so no build method required

  //returns a row vector of the weighted sums of: the gating networks confidence
  //in each expert and the experts confidence in each class. One entry in the
  //returned tensor for each corresponding class
  call(inputs: tf.Tensor[]): tf.Tensor {
    const gate: tf.Tensor = inputs[0];
    const branches: tf.Tensor[] = inputs.slice(1);
    //numClasses is the final dimension of an expert's shape
    //so look at the first expert and take its final dim
    const numClasses = branches[0].shape.slice(-1)[0];

    // Calculate the weighted sum for multiclass classification
    // cleaning up extra tensors along the way
    const add = tf.tidy(() => {
      const weightedSums: tf.Tensor[] = [];
      for (let i = 0; i < branches.length; i++) {
        const branchTranspose = tf.transpose(branches[i]);
        //extract the weighting for this specific expert
        const gateSlice = gate.slice([0, i], [-1, 1]);
        const weightedSum = tf.matMul(branchTranspose, gateSlice);
        weightedSums.push(weightedSum);
      }
    
      var ret = tf.sum(tf.stack(weightedSums), 0);
      ret = ret.reshape([1,numClasses])
      //normalize confidences
      const mag = tf.norm(ret)
      ret = ret.div(mag)
      return ret 
    });

    return add;
  }
  //necessary else we get an undefined error somewhere
  getClassName() {
    return 'MoEfull';
  }
  
  //necessary as shape can't be automatically computed and
  //we get an undefined error somewhere
  computeOutputShape(inputShape : tf.Shape[]) {
    //look at first expert, its last shape dimension is number of classes
    const numClasses = inputShape[1].slice(-1)[0];
    if (numClasses == null || !Number.isInteger(numClasses) || numClasses <= 0) {
      throw new Error('Invalid number of classes');
    }
    return [1, numClasses]
  }

}

class MoEModelTrainer implements ModelTrainer<LayersMLModel> {
  constructor(private settings: MoEModelTrainingSettings) {}
  public async trainModel(trainingData: TrainingData): Promise<LayersMLModel> {
    // Fetch data
    const features: Array<number[]> = [];
    const labels: Array<number[]> = [];
    const numberOfClasses = trainingData.classes.length;

    trainingData.classes.forEach((gestureClass, index) => {
      gestureClass.samples.forEach(sample => {
        features.push(sample.value);

        const label: number[] = new Array(numberOfClasses) as number[];
        label.fill(0, 0, numberOfClasses);
        label[index] = 1;
        labels.push(label);
      });
    });

    const tensorFeatures = tf.tensor(features);
    const tensorLabels = tf.tensor(labels);

    // Find the shape by looking at the first data point
    const shape = [trainingData.classes[0].samples[0].value.length];

    // Construct the final MoE model
    const input = tf.input({ shape: shape });
    const gateOutput = applyGatingNetwork(input, this.settings.noOfUnits, this.settings.numExperts) as tf.Tensor<tf.Rank>;
    const expertOutputs = Array.from(Array(this.settings.numExperts)).map(() =>
      applyExpertNetwork(input, this.settings.noOfUnits, numberOfClasses),
    );

    const combined = [gateOutput, ...expertOutputs];
    const multiplierOutput = new GatingMultiplier().apply(
      combined,
    ) as tf.SymbolicTensor;

    //must be softmax at output layer to convert to a probability distribution
    const output = tf.layers 
      .dense({ units: numberOfClasses, activation: 'softmax' })
      .apply(multiplierOutput) as tf.SymbolicTensor;

    const moeModel = tf.model({ inputs: input, outputs: output});

    /*
    class AccuracyLogger extends tf.CustomCallback {
      constructor() {
        super({});
      }

      async onEpochEnd(epoch: number, logs: tf.Logs) {
        const accuracy = logs["loss"] as number; 
        const totalTests = logs["mean_absolute_error"] as number; 
        console.log(accuracy);

        if (!isNaN(accuracy) && !isNaN(totalTests) && totalTests !== undefined) {
          const passedTests = Math.round(totalTests * accuracy); // Number of tests passed
          console.log(`Epoch ${epoch}: ${passedTests} out of ${totalTests} tests passed`);
        } else {
          console.warn(`Epoch ${epoch}: Accuracy or total tests is NaN or undefined`);
        }
      }
    }*/

    // Compile the MoE model
    moeModel.compile({
      loss: 'categoricalCrossentropy',
      optimizer: tf.train.adam(this.settings.learningRate),
      metrics: ['accuracy'],
    });

    //const accuracyLogger = new AccuracyLogger();

    // Train the MoE model
    const history = await moeModel
      .fit(tensorFeatures, tensorLabels, {
        epochs: this.settings.noOfEpochs,
        batchSize: this.settings.batchSize,
        validationSplit: this.settings.validationSplit,
        /*callbacks: [accuracyLogger],*/
      })
      .catch(err => {
        console.error('TensorFlow training process failed:', err);
        return Promise.reject(err);
      });

    //logs a list of 0s and 1s for each epoch, if every item in epoch
    //was classified then 1 else 0
    console.log("val_acc: ", history.history['val_acc']);

    return Promise.resolve(new LayersMLModel(moeModel));
  }
}

export default MoEModelTrainer;
