# Usa una imagen base de Node.js 18 o superior
FROM node:24-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# Instala pnpm globalmente
RUN npm install -g pnpm && pnpm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expón el puerto donde corre la app
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]
