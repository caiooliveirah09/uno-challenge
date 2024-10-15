# Infraestrutura do projeto

## Como fazer o deploy?

Você deverá ter uma conta no aws e o aws-cli configurado no seu computador com sua conta antes de começar.

Deverá rodar o comando `yarn` ou `npm install` na pasta da infrastructure.

Após ter instalado as dependências com o comando acima, recomendo começar pelo deploy do backend, com o o comando `npm run cdk deploy BackendStack`, se tiver algum perfil especificado, use `npm run cdk deploy BackendStack -- --profile {nome do perfil aqui}`.

Finalizado o deploy do backend, pegue o link do LoadBalancer e preencha o .env do frontend com o link do LoadBalancer gerado no deploy do Backend, rode o build com o comando `npm run build` dentro da pasta do frontend, e agora só rodar `npm run cdk deploy FrontendStack`.

obs: O link do acesso ao LoadBalancer e do Frontend aparecem no terminal no final de cada deploy.
