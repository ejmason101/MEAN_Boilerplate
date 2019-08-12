FROM centos/nodejs-10-centos7

USER root

ENV PATH=${PATH}:/opt/rh/rh-nodejs8/root/usr/bin

COPY . .

RUN npm cache clean --force

RUN npm install

RUN npm rebuild bcrypt --build-from-source

CMD /usr/libexec/s2i/run
