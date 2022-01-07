FROM nvidia/cudagl:10.2-base-ubuntu18.04

WORKDIR /Miroir/

RUN apt-get update && \
  apt-get -y install python3-pip python3-pyaudio libusb-1.0-0-dev \
  libgl1-mesa-glx nano git curl libasound2 chromium-browser \
  libgtk-3-0 reptyr

ADD build/cpu/requirements.txt .
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

RUN apt-get -o Dpkg::Options::="--force-confmiss" install --reinstall netbase

RUN apt-get -y install

RUN ln -s /usr/bin/chromium-browser /usr/bin/chromium
ENV DEVICE cpu

RUN useradd -m -s /bin/bash miroir
COPY . .

RUN chmod -R 777 /Miroir/

CMD su miroir -s /bin/bash -c "python3 init.py"
