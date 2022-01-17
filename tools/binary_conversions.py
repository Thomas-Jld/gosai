import json
import struct

import numpy as np

def color_to_bytes(array: np.ndarray) -> bytes:
    """Convert color frame to binary"""
    h, w, c = array.shape
    shape = struct.pack('>III',h,w,c)
    return shape + array.tobytes()

def bytes_to_color(encoded: bytes) -> np.ndarray:
    """Convert binary to color frame"""
    try:
        h, w, c  = struct.unpack('>III',encoded[:12])
        array = np.frombuffer(encoded[12:], dtype=np.uint8).reshape(h,w,c)
        return array
    except:
        return None

def depth_to_bytes(array: np.ndarray) -> bytes:
    """Convert depth frame to binary"""
    h, w = array.shape
    shape = struct.pack('>II',h,w)
    return shape + array.tobytes()

def bytes_to_depth(encoded: bytes) -> np.ndarray:
    """Convert binary to depth frame"""
    try:
        h, w = struct.unpack('>II',encoded[:8])
        array = np.frombuffer(encoded[8:], dtype=np.uint16).reshape(h,w)
        return array
    except:
        return None

def dict_to_bytes(x: dict) -> bytes:
    """Convert dictionary to bytes"""
    return json.dumps(x)

def bytes_to_dict(b: bytes) -> dict:
    """Convert bytes to dictionary"""
    try:
        return json.loads(b)
    except:
        return None

def list_to_bytes(x: list) -> bytes:
    """Convert list to bytes"""
    return json.dumps(x)

def bytes_to_list(b: bytes) -> list:
    """Convert bytes to list"""
    try:
        return json.loads(b)
    except:
        return None
