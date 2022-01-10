# Pose estimation Driver

import time

import core.hal.drivers.pose.utils.hands_signs as hs
import core.hal.drivers.pose.utils.pose_estimation as pe
from core.hal.drivers.driver import BaseDriver
from core.hal.drivers.pose.utils.reflection import project


class Driver(BaseDriver):
    """
    * Body pose from mediapipe
    ! Only one instance from mediapipe can run
    """

    def __init__(self, name: str, parent, max_fps: int = 45):
        super().__init__(name, parent)

        self.holistic = pe.init()
        self.sign_provider = hs.init()

        self.register_to_driver("video", "color")
        self.register_to_driver("video", "depth")

        self.create_event("raw_data")
        self.create_event("projected_data")

        self.debug_time = False
        self.debug_data = False
        self.fps = max_fps
        self.window = 0.7



    def pre_run(self):
        time.sleep(0.5)
        self.source = self.parent.get_driver_event_data("video", "source")
        # print(self.source)

    def loop(self):
        """Main loop"""
        start_t = time.time()

        color = self.parent.get_driver_event_data("video", "color")
        depth = self.parent.get_driver_event_data("video", "depth")


        if color is not None and depth is not None:
            # t01 = time.time()
            raw_data = pe.find_all_poses(self.holistic, color, self.window)
            # print(f"get_data: {1000*(time.time() - t01)}")

            self.set_event_data("raw_data", raw_data)

            if self.debug_data:
                self.log(raw_data)

            if bool(raw_data["body_pose"]):
                flag_1 = time.time()

                eyes = raw_data["body_pose"][0][0:2]

                body = project(
                    points=raw_data["body_pose"],
                    eyes_position=eyes,
                    video_provider=self.source,
                    depth_frame=depth,
                    depth_radius=2,
                )
                projected_data = {"body_pose": body}

                projected_data["right_hand_pose"] = project(
                    points=raw_data["right_hand_pose"],
                    eyes_position=eyes,
                    video_provider=self.source,
                    depth_frame=depth,
                    depth_radius=2,
                    ref=body[15],
                )

                if len(raw_data["right_hand_pose"]) > 0:
                    raw_data["right_hand_sign"] = hs.find_gesture(
                        self.sign_provider,
                        hs.normalize_data(
                            raw_data["right_hand_pose"],
                            self.source["width"],
                            self.source["height"]
                        ),
                    )

                projected_data["left_hand_pose"] = project(
                    points=raw_data["left_hand_pose"],
                    eyes_position=eyes,
                    video_provider=self.source,
                    depth_frame=depth,
                    depth_radius=2,
                    ref=body[16],
                )

                if len(raw_data["left_hand_pose"]) > 0:
                    projected_data["left_hand_sign"] = hs.find_gesture(
                        self.sign_provider,
                        hs.normalize_data(
                            raw_data["left_hand_pose"],
                            self.source["width"],
                            self.source["height"]
                        ),
                    )

                projected_data["face_mesh"] = project(
                    points=raw_data["face_mesh"],
                    eyes_position=eyes,
                    video_provider=self.source,
                    depth_frame=depth,
                    depth_radius=2,
                    ref=body[2],
                )

                self.set_event_data("projected_data", projected_data)
                if self.debug_data:
                    self.log(projected_data)

                flag_2 = time.time()

                if self.debug_time:
                    self.log(f"Inference: {(flag_1 - start_t)*1000} ms")
                    self.log(f"Projection: {(flag_2 - flag_1)*1000} ms")

        else:
            self.log("No color or depth data", 1)

        end_t = time.time()

        if self.debug_time:
            self.log(f"Total time: {(end_t - start_t)*1000}ms")
            self.log(f"FPS: {int(1/(end_t - start_t))}")

        dt = max((1 / self.fps) - (end_t - start_t), 0.0001)

        time.sleep(dt)
