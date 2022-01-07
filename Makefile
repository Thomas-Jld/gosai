.PHONY: build

include .env

USER=thomasj27
REPO=gosai
IMNAME = ${USER}/${REPO}
TAG = ${PLATFORM}-${DEVICE}-${VERSION}

boot:
	python3 init.py

install:
	pip3 install -r requirements.txt

build:
	nvidia-docker build -t $(IMNAME):$(TAG) -f build/${DEVICE}/Dockerfile .

push:
	nvidia-docker push $(IMNAME):$(TAG)

pull:
	nvidia-docker pull $(IMNAME):$(TAG)

launch:
	-sudo xhost +local:root
ifeq (${DEVICE}, gpu)
	-nvidia-docker rm $(REPO)
	nvidia-docker run --expose 5000 -e PYTHONUNBUFFERED=1 --network="host" --privileged --volume=/dev:/dev -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY -e QT_X11_NO_MITSHM=1 --name=$(REPO) $(IMNAME):$(TAG)
else
	-nvidia-docker rm $(REPO)
	nvidia-docker run -d --expose 5000 --network="host" --privileged --volume=/dev:/dev -e DISPLAY -e QT_X11_NO_MITSHM=1 --name=$(REPO) $(IMNAME):$(TAG)
endif

stop:
	-nvidia-docker stop $(REPO)
