FROM node:18-slim

RUN useradd -m -s /bin/bash hth

WORKDIR /home/hth

COPY package.json .
COPY package-lock.json .
COPY app ./challs

RUN npm install --production
RUN chown -R hth:hth /home/hth

# Switch to the non-root user
USER hth

EXPOSE 2025

CMD ["npm", "start"]