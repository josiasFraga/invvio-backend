# Invvio Backend

## Configuração do Ambiente

1. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
PORT=3000
JWT_SECRET=supersecret
JWT_EXPIRES=7d
DB_HOST=127.0.0.1
DB_PORT=3308
DB_USER=root
DB_PASS=
DB_NAME=invvio
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Invvio <no-reply@invvio.local>"
APP_URL=http://localhost:3000
```

2. Instale as dependências:

```
npm install
```

3. Execute o projeto em modo de desenvolvimento:

```
npm run start:dev
```

4. Acesse a documentação Swagger em:

```
http://localhost:3000/docs
```

## Scripts Disponíveis

- `npm run start`: Inicia o servidor em produção.
- `npm run start:dev`: Inicia o servidor em modo de desenvolvimento.
- `npm run build`: Compila o projeto.
- `npm run test`: Executa os testes.
- `npm run lint`: Verifica o código com ESLint.

## Estrutura do Projeto

- **Auth**: Registro, login e autenticação JWT.
- **Users**: Gerenciamento de perfil e busca de usuários.
- **Transfers**: Mock de transferências.
- **Password Reset**: Fluxo completo de reset de senha.

## Observações

- `synchronize: true` está habilitado apenas em desenvolvimento.
- Em produção, utilize migrations para gerenciar o banco de dados.
