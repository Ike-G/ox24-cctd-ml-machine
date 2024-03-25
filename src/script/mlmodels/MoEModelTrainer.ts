/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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

    class expertNetwork extends tf.layers.Layer {
      normalizer : any
      dense : any
      softmax : any //When given their actual types gives an error?
      constructor(numUnits : number) {
        super({});
        this.normalizer = tf.layers.batchNormalization()
        this.dense = tf.layers.dense({ units: numUnits, activation: 'relu' })
        this.softmax = tf.layers.dense({ units: numberOfClasses, activation: 'softmax' })
      }

      call(inputs: tf.Tensor) : tf.Tensor {
        var out : tf.Tensor = this.normalizer.apply(inputs)
        out = this.dense.apply(out)
        out = this.softmax.apply(out)
        return out
      }
      getClassName() {return "expertNetwork"}
    }

    class gatingNetwork extends tf.layers.Layer {
      normalizer : any
      dense : any
      softmax : any //When given their actual types gives an error?
      constructor(numExperts : number) {
        super({});
        this.normalizer = tf.layers.batchNormalization()
        this.dense = tf.layers.dense({ units: numExperts, activation: 'relu' })
        this.softmax = tf.layers.dense({ units: numExperts, activation: 'softmax' })
      }

      call(inputs: tf.Tensor) : tf.Tensor {
        var out : tf.Tensor = this.normalizer.apply(inputs)
        out = this.dense.apply(out)
        out = this.softmax.apply(out)
        return out
      }

      getClassName() {return "expertNetwork"}
    }

    class gatingMultiplier extends tf.layers.Layer {
      constructor() {
          super({});
      }

      call(inputs: tf.Tensor[]): tf.Tensor {
          console.log("Made it here")
          const gate: tf.Tensor = inputs[0];
          const branches: tf.Tensor[] = inputs.slice(1);
  
          // Calculate the weighted sum for multiclass classification
          // cleaning up extra tensors along the way
          const add = tf.tidy(() => {
              const weightedSums: tf.Tensor[] = [];
              for (let i = 0; i < branches.length; i++) {
                  const branchTranspose = tf.transpose(branches[i]);
                  //extract the weighting for this specific expert
                  const gateSlice = gate.slice([0, i], [-1, 1]);
                  console.log("Gateslice:", gateSlice);
                  //const gateSlice = gate[i]
                  const weightedSum = tf.mul(branchTranspose, gateSlice);
                  weightedSums.push(weightedSum);
              }
              return tf.sum(tf.stack(weightedSums), 0);
          });

          return add;
      }
      getClassName() {return 'MoEfull';}
    }

    // Find the shape by looking at the first data point
    const shape = [trainingData.classes[0].samples[0].value.length];
  
    // Construct the final MoE model
    const input = tf.input({ shape: shape });

    const expertNetworks : Array<expertNetwork> = [];
    for (let i = 0; i < this.settings.numExperts; i++) {
      const expert = new expertNetwork(this.settings.noOfUnits);
      expertNetworks.push(expert);
    }
    const gN = new gatingNetwork(this.settings.numExperts);
    const multiplierLayer = new gatingMultiplier();
    //const testLayer = tf.layers.dense({ units: this.settings.noOfUnits, activation: 'relu' })
    //const testOutput = testLayer.apply(input) as tf.Tensor

    const gateOutput = gN.apply(input) as tf.Tensor
    const expertOutputs = expertNetworks.map((net) => net.apply(input)) as tf.Tensor[]
    const multiplierInput : Array<tf.Tensor> = [gateOutput].concat(expertOutputs)

    const output : tf.SymbolicTensor =  multiplierLayer.apply(multiplierInput) as tf.SymbolicTensor;
    const moeModel = tf.model({ inputs: input, outputs: output }) as tf.LayersModel;

    // Compile the MoE model
    moeModel.compile({
      loss: 'categoricalCrossentropy',
      optimizer: tf.train.adam(this.settings.learningRate),
      metrics: ['accuracy'],
    });

    // Train the MoE model
    await moeModel.fit(tensorFeatures, tensorLabels, {
      epochs: this.settings.noOfEpochs,
      batchSize: this.settings.batchSize,
      validationSplit: this.settings.validationSplit,
    }).catch(err => {
      console.error('TensorFlow training process failed:', err);
      return Promise.reject(err);
    });
    return Promise.resolve(new LayersMLModel(moeModel));
  }

}

export default MoEModelTrainer;