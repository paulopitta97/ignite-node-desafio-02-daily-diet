## Ignite NodeJS da Rocketseat 🚀

### Projeto desenvolvido como 'Desafio 02' do Módulo 'Criando API REST com Node.js' no Bootcamp Ignite da Rocketseat. 

![banner-ignite-nodejs-600x-42e1ab80-77af-11eb-9e07-47f9e46b3e6e](https://user-images.githubusercontent.com/52472087/224563992-1fbf29d0-06d9-4b58-b9d0-522f3f283f1e.png)

- Consiste em uma API RESTful com Node.js para controle de dieta diária com `Fastify`, `Knex` (com `Migrations`), `Zod`, etc.
- Foram utilizadas `eslint`, `dotenv`, entre outros. Banco de dados relacional sendo o local com `Sqlite` e produção com `Postgre`.
- Foram realizados testes com `vitest` e `supertest`. 

### Regras da aplicação

- Deve ser possível criar um usuário
- Deve ser possível identificar o usuário entre as requisições
- Deve ser possível registrar uma refeição feita, com as seguintes informações:
    
    *As refeições devem ser relacionadas a um usuário.*
    
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
- Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição
- Deve ser possível recuperar as métricas de um usuário
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência por dia de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

### Configurando e executando:

```
npm install
npm run dev
```

### Executando os testes:

```
npm run test
```

### 📝 Licença

- [MIT](https://github.com/paulopitta97/ignite-node-desafio-02-daily-diet/blob/master/LICENSE) © [Paulo Pitta](https://github.com/paulopitta97)
