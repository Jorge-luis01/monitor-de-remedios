# Dose Certa no Windows

Dê dois cliques em `iniciar-app.cmd` nesta pasta. A interface abre em
http://localhost:5173. Mantenha a janela do terminal aberta durante o uso;
pressione Ctrl+C para parar.

O iniciador usa o Node.js instalado e instala as dependências com `npm ci`
caso ainda não existam. A porta 5173 precisa estar livre.

## Ambiente encontrado

- Node.js 24.19.0 e npm 11.17.0.
- Java JDK 26.0.2; o backend compila para Java 25.
- Maven 3.9.16 no cache local, fora do PATH. `mvn-local.cmd` permite utilizá-lo.
- Dependências do frontend já instaladas.
- H2 integrado ao backend: não é necessário instalar MySQL ou PostgreSQL.

## Backend opcional

A interface atual salva os dados no navegador e ainda não usa a API.
Para trabalhar no backend, abra o PowerShell nesta pasta:

```powershell
cd backend-java
..\mvn-local.cmd test
# Configure DOSE_CERTA_API_TOKEN com um segredo aleatório de pelo menos 32 caracteres.
..\mvn-local.cmd spring-boot:run
```

A API responde em http://localhost:8080/api/health. As operações de medicamentos
exigem o token descrito em `backend-java/README.md`.

Os alarmes nativos com o app fechado são recursos da versão Android.
O iniciador acima executa a versão web no PC.

## Validação realizada

Os 7 testes do frontend, a compilação da interface e os 14 testes do backend
passaram. A interface respondeu HTTP 200 na porta 5173.
O empacotamento executável do backend falhou ao renomear o JAR em `target`
por bloqueio de arquivo; a execução da API não foi confirmada nesta análise.
