# Pose estimation Driver

import os
import sys
import time

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

import utils.hands_signs as hs
import utils.pose_estimation as pe
from driver import BaseDriver
from utils.reflection import project


class Pose(BaseDriver):
    """
    * Body pose from mediapipe
    ! Only one instance from mediapipe can run
    """

    def __init__(self, name, parent, max_fps: int = 45):
        super().__init__(name, parent)

        self.holistic = pe.init()
        self.sign_provider = hs.init()
        self.paused = False

        self.raw_data = {}
        self.registered["raw_data"] = []

        self.projected_data = {}
        self.registered["projected_data"] = []

        self.debug_time = False
        self.debug_data = False
        self.fps = max_fps
        self.window = 0.7

    def run(self):
        super().run()
        # * Home made hand signs recognition : https://github.com/Thomas-Jld/gesture-recognition

        while 1:
            if not self.paused:
                start_t = time.time()

                if (
                    self.parent.drivers["video"].color is not None
                    and self.parent.drivers["video"].depth is not None
                ):
                    self.raw_data = pe.find_all_poses(
                        self.holistic, self.parent.drivers["video"].color, self.window
                    )
                    self.notify("raw_data")
                    if self.debug_data:
                        print(self.raw_data)

                    if bool(self.raw_data["body_pose"]):
                        flag_1 = time.time()

                        eyes = self.raw_data["body_pose"][0][0:2]

                        body = project(
                            points=self.raw_data["body_pose"],
                            eyes_position=eyes,
                            video_provider=self.parent.drivers["video"].source,
                            depth_frame=self.parent.drivers["video"].depth,
                            depth_radius=2,
                        )
                        self.projected_data["body_pose"] = body

                        self.projected_data["right_hand_pose"] = project(
                            points=self.raw_data["right_hand_pose"],
                            eyes_position=eyes,
                            video_provider=self.parent.drivers["video"].source,
                            depth_frame=self.parent.drivers["video"].depth,
                            depth_radius=2,
                            ref=body[15],
                        )

                        if len(self.raw_data["right_hand_pose"]) > 0:
                            self.raw_data["right_hand_sign"] = hs.find_gesture(
                                self.sign_provider,
                                hs.normalize_data(
                                    self.raw_data["right_hand_pose"],
                                    self.parent.drivers["video"].source.width,
                                    self.parent.drivers["video"].source.height,
                                ),
                            )

                        self.projected_data["left_hand_pose"] = project(
                            points=self.raw_data["left_hand_pose"],
                            eyes_position=eyes,
                            video_provider=self.parent.drivers["video"].source,
                            depth_frame=self.parent.drivers["video"].depth,
                            depth_radius=2,
                            ref=body[16],
                        )

                        if len(self.raw_data["left_hand_pose"]) > 0:
                            self.projected_data["left_hand_sign"] = hs.find_gesture(
                                self.sign_provider,
                                hs.normalize_data(
                                    self.raw_data["left_hand_pose"],
                                    self.parent.drivers["video"].source.width,
                                    self.parent.drivers["video"].source.height,
                                ),
                            )

                        self.projected_data["face_mesh"] = project(
                            points=self.raw_data["face_mesh"],
                            eyes_position=eyes,
                            video_provider=self.parent.drivers["video"].source,
                            depth_frame=self.parent.drivers["video"].depth,
                            depth_radius=2,
                            ref=body[2],
                        )

                        self.notify("projected_data")

                        flag_2 = time.time()

                        if self.debug_time:
                            print(f"Inference: {(flag_1 - start_t)*1000} ms")
                            print(f"Projection: {(flag_2 - flag_1)*1000} ms")
                            print(f"Adding to queue: {(time.time() - flag_2)*1000} ms")

                end_t = time.time()

                if self.debug_time:
                    print(f"Total inference time: {(end_t - start_t)*1000}ms")
                    print(f"FPS: {int(1/(end_t - start_t))}")

                dt = max(1 / self.fps - (end_t - start_t), 0.0001)
                time.sleep(dt)
            else:
                time.sleep(5)
