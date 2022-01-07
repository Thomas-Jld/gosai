import os

import numpy as np
import onnxruntime


SLR_ACTIONS = [
    "nothing",
    "empty",
    "hello",
    "thanks",
    "iloveyou",
    "what's up",
    "my",
    "name",
    "nice",
    "to meet you",
]


def adapt_data(frames: list) -> list:
    """
    Adapt data to the model
    """
    new_frames = []
    for frame in frames:
        frame = frame[0:33*4] + frame[33*4+468*3:]
        new_frames.append(frame)
    return new_frames


def init():
    """
    Initialize the module
    """
    # dir_path = os.path.dirname(os.path.realpath(__file__))
    # model_path = os.path.join(dir_path, "models/handsign.onnx")
    # model = onnxruntime.InferenceSession(model_path)
    return "ok"


def get_sign(model, frames: list) -> list:
    """
    Get sign from frames
    """
    data = adapt_data(frames)
    ort_inputs = {model.get_inputs()[0].name: np.array(data, dtype=np.float32)}
    out = model.run(None, ort_inputs)[-1]
    return (SLR_ACTIONS[np.argmax(out)], )
