include .env

USER=thomasj27
REPO=${PLATFORM}_${DEVICE}_${VERSION}
IMNAME = ${USER}/${REPO}

boot:
	python3 init.py

install:
	pip3 install -r requirements.txt

build:
	nvidia-docker build -t $(IMNAME) -f build/${DEVICE}/Dockerfile .

launch:
ifeq (${DEVICE}, gpu)
	-nvidia-docker rm $(REPO)
	nvidia-docker run --expose 5000 -e PYTHONUNBUFFERED=1 --network="host" --privileged --volume=/dev:/dev -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=${DISPLAY} -e QT_X11_NO_MITSHM=1 --name=$(REPO) $(IMNAME)
else
	-nvidia-docker rm $(REPO)
	nvidia-docker run --expose 5000 -e PYTHONUNBUFFERED=1 --network="host" --privileged --volume=/dev:/dev --name=$(REPO) $(IMNAME)
endif
