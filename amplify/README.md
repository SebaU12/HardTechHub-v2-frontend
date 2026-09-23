# Frontend en AWS Amplify

Esta carpeta contiene un stack CloudFormation independiente para publicar el
frontend React de HardTech Hub en AWS Amplify Hosting.

## Recursos creados

- una aplicación `AWS::Amplify::App` conectada al repositorio público;
- una rama `AWS::Amplify::Branch` de producción con compilación automática;
- la variable de compilación `VITE_API_BASE_URL` con el endpoint de API Gateway;
- una regla de reescritura HTTP 200 para las rutas de React Router;
- outputs con el ID, dominio, URL pública, repositorio y API configurada.

Amplify ejecuta desde la raíz del repositorio:

```text
npm ci --prefix frontend
npm run build --prefix frontend
```

Después publica `frontend/dist`.

Al terminar CloudFormation, `deploy.sh` comprueba si la rama ya tiene algún job.
Si es una instalación nueva, inicia explícitamente el primer job `RELEASE`. Los
push posteriores se despliegan mediante el build automático de la rama.

## Requisitos

- AWS CLI autenticado en la cuenta del proyecto;
- permisos para CloudFormation y Amplify;
- el código del frontend enviado a la rama pública que se desplegará;
- un token personal de GitHub capaz de autorizar la conexión de Amplify con el
  repositorio. CloudFormation marca el parámetro como `NoEcho` y Amplify no
  almacena el token después de autorizar la conexión.

No escribas el token en un archivo `.env`, en la plantilla ni en Git.

## Despliegue

Desde la raíz del proyecto:

```bash
read -rsp "GitHub token: " GITHUB_ACCESS_TOKEN
echo
export GITHUB_ACCESS_TOKEN

bash infrastructure/amplify/deploy.sh us-east-1 hardtech-amplify-web main
unset GITHUB_ACCESS_TOKEN
```

El script usa por defecto:

```text
Repositorio: https://github.com/SebaU12/HardTechHub-v2
API Gateway: https://s7d3vxbohi.execute-api.us-east-1.amazonaws.com
```

Para reemplazar el endpoint después de recrear el backend:

```bash
export API_BASE_URL="https://NUEVO_ID.execute-api.us-east-1.amazonaws.com"
export GITHUB_ACCESS_TOKEN="TU_TOKEN_TEMPORAL"
bash infrastructure/amplify/deploy.sh us-east-1 hardtech-amplify-web main
unset GITHUB_ACCESS_TOKEN API_BASE_URL
```

CloudFormation actualizará la variable de Amplify. Para recompilar de inmediato
después de cambiar únicamente la configuración, inicia un nuevo job desde
**Amplify > hardtech-hub-web > main > Redeploy this version**.

## Validación

Consulta los outputs del stack:

```bash
aws cloudformation describe-stacks \
  --stack-name hardtech-amplify-web \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
```

Obtén el estado de los últimos builds:

```bash
APP_ID=$(aws cloudformation describe-stacks \
  --stack-name hardtech-amplify-web \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='AmplifyAppId'].OutputValue" \
  --output text)

aws amplify list-jobs \
  --app-id "$APP_ID" \
  --branch-name main \
  --region us-east-1 \
  --max-results 5
```

Finalmente, abre el output `WebsiteUrl` y valida al menos estas rutas:

```text
/
/productos
/productos/1
/compatibilidad
/analitica
```

Abrir directamente `/productos/1` debe devolver la aplicación y no un 404.

## Actualizaciones automáticas

`EnableAutoBuild` está habilitado. Después de conectar correctamente el
repositorio, cada `push` a la rama configurada genera una nueva compilación y un
despliegue atómico en Amplify.

## Eliminar el hosting

```bash
aws cloudformation delete-stack \
  --stack-name hardtech-amplify-web \
  --region us-east-1
```

Eliminar este stack no modifica API Gateway, las instancias EC2 ni el data lake.
