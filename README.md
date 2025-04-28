# Rhino Energy Prediction Plugin

## Overview

Rhino Energy Prediction Plugin is designed to support architects in making energy-informed design decisions early in the building process. The plugin enables users to create or modify building models and receive predictions for heating and cooling loads using a machine learning (ML) model. Architects can gauge building energy performance early (concept stage) using the Rhino Energy Prediction Plugin. The plugin embeds a self-contained ONNX runtime directly in Grasshopper.

## Features

- **Model Initialization**  
  Reads an ONNX model file path and sets up an `InferenceSession` that exposes each input tensor’s name, datatype, and shape.

- **Real-Time Inference**  
  Packs Grasshopper inputs into dense tensors, executes the ONNX model, and returns the first element of the output array as an energy load estimate.

- **Automatic Feature Extraction**  
  Companion Python script reads 3D building geometry and computes features such as roof area, window-to-wall ratio, floor area, and number of stories.

- **Pure C# Runtime**  
  Runs entirely in .NET via Microsoft’s ONNX Runtime—no Python interpreter required at inference time.

## Architecture

1. **Component Initialization**  
   The plugin reads the ONNX model path from the Grasshopper input.  
   It then creates an `InferenceSession` and retrieves input tensor metadata.

2. **Input Packing**  
   Grasshopper values are loaded into dense tensors that match the ONNX input shapes.

3. **Model Inference**  
   The plugin runs the ONNX model with the packed inputs and receives an output array.  
   The first element of that array is sent to the Grasshopper output.

4. **Feature Extraction Script**  
   A Python helper extracts building features automatically by classifying layers named `Wall`, `Slab`, `Window`, and `Roof`.

## Installation

1. Download the `VIP_Energy_Plugin` folder.  
2. Copy it to your Grasshopper Libraries folder:
   ```
   C:\Users\YourUserName\AppData\Roaming\Grasshopper\Libraries
   ```
3. Launch Rhino and open Grasshopper.  
4. Drag the **VIPPlugin** component from the Params tab onto the canvas.  
5. Provide the ONNX model file path to the component input.  
6. View the energy load prediction on the second output parameter.

## Workflow

1. Open Rhino and start Grasshopper.  
2. Place the VIPPlugin component and connect the ONNX model path.  
3. Sketch or import a building mass in Rhino.  
4. Run the feature extraction script to compute geometry parameters.  
5. Grasshopper packs the inputs and runs the ONNX model.  
6. Inspect the real-time energy load estimate.

## Requirements

- **Rhino 7+** – Plugin host environment  
- **Windows OS** – .NET and Rhino SDK compatibility  
- **.NET Framework 4.8+** – ONNX Runtime support  
- **Python 3.8+** – Feature extraction and model conversion scripts  
- **ONNX model file** – Trained energy prediction model  

## Tech Stack

- **Rhino SDK (C#)** – Core plugin development and geometry handling  
- **Grasshopper (C#)** – Dynamic component architecture  
- **Microsoft ONNX Runtime** – High-performance model inference  
- **Python** – Building feature extraction and `.joblib` → `.onnx` conversion  
- **scikit-learn / sklearn-onnx** – Model training and conversion  

## Roadmap

- **Real-Time EUI Feedback**  
  Provide energy use intensity updates as users modify height, WWR, and story count.

- **Flexible Model Inputs**  
  Detect parameter names and types automatically to support multiple climates and typologies.

- **Multi-Format Support**  
  Add seamless handling of both `.onnx` and `.joblib` models with built-in feature mapping.

- **Map Integration**  
  Link with an energy prediction map to import existing building geometry and simulate retrofits.

- **Custom Tab**  
  Give PlugIn standalone VIPEnergy tab so that future energy related plugins that work in the Rhino/GH environment may be added to this parent group.
---

# Extracting Vegetation Data

## Overview

We examined various methods of extracting vegetation data for use with the models due to the effect of shading on the heating and cooling load of nearby buildings.

## NDVI Analysis

NDVI (Normalized Difference Vegetation Index) is a metric used to quantify the health and density of vegetation from satellite imagery. Seemed promising at first, but does 
not provide any way of estimating vegetation height, which is likely needed as a metric for the model to be trained on.

## [TreeCountSegHeight](https://github.com/sizhuoli/TreeCountSegHeight)

A recently developed model called TreeCountSegHeight was also examined for potential integration with the model. It seemed to fit our purposes quite well, returning an estimate
of tree height from input satellite imagery, but was found to be very computationally intensive. It may have potential to yield results given sufficient hardware, but this was
a stumbling point in the workflow. 

## Next Steps

Continue searching for a lightweight/efficient way to extract vegetation height from satellite imagery.
