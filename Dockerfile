### Build and install packages
FROM python:3.6 as build-python

RUN \
  apt-get -y update && \
  apt-get install -y gettext && \
  # Cleanup apt cache
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

ADD requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r /app/requirements.txt


### Build static assets
FROM node:10 as build-nodejs

ARG STATIC_URL
ENV STATIC_URL ${STATIC_URL:-/static/}

# Install node_modules
ADD webpack.config.js app.json package.json package-lock.json tsconfig.json webpack.d.ts /app/
WORKDIR /app
RUN npm install

# Build static
ADD ./saleor/static /app/saleor/static/
ADD ./templates /app/templates/
RUN \
  STATIC_URL=${STATIC_URL} \
  npm run build-emails --production

### Final image
FROM tiangolo/uwsgi-nginx:python3.6
ENV PYTHONUNBUFFERED 1

ARG STATIC_URL
ENV STATIC_URL ${STATIC_URL:-/static/}

RUN \
  apt-get update && \
  apt-get install -y libxml2 libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 shared-mime-info mime-support && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

ADD . /app
ADD ./saleor/static /app/saleor/static/
COPY --from=build-python /usr/local/lib/python3.6/site-packages/ /usr/local/lib/python3.6/site-packages/
COPY --from=build-python /usr/local/bin/ /usr/local/bin/
COPY --from=build-nodejs /app/templates /app/templates
WORKDIR /app

RUN python3 manage.py collectstatic
RUN pip install --force uwsgi

#RUN useradd --system saleor && \
#    mkdir -p /app/media /app/static && \
#    chown -R saleor:saleor /app/

#USER saleor


# CMD ["uwsgi", "/app/saleor/wsgi/uwsgi.ini"]

#USE OWN NGINX CONF(MORE CONFIGURABLE)
COPY nginx.conf /etc/nginx/conf.d/
ENV UWSGI_INI /app/saleor/wsgi/uwsgi.ini

EXPOSE 8000
