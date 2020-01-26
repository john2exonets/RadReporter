FROM node:alpine

RUN mkdir /radreporter
WORKDIR /radreporter

ADD package.json /radreporter/
RUN npm install

COPY RadReporter.js /radreporter

ADD package.json /radreporter/
ADD VERSION .

#EXPOSE 53
#EXPOSE 5380

#ENTRYPOINT [ "node", "/radreporter/RadReporter.js" ]
CMD [ "npm", "start" ]

