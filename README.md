# Challenge Backend Sr. – Node.js

## Desafios - Implementação de Endpoints
Para esse desafio devemos implentar 2 endpoints, um que receba um array de números e retorne os números únicos em ordem crescente e outro que faça uma requisição a um serviço externo e retorne os dados tratados no formato JSON.

### Endpoint 1: `/unique-array`
Método: `POST`

Descrição: Recebe um array de números no corpo da requisição e retorna os números 
únicos em ordem crescente.

Entrada:
```json
{
  "array": [1, 2, 3, 4, 5, 6, 2, 5, 4, 3, 9, 1, 4, 8, 2, 6, 5, 4]
}
```

Saída:
```json
{
  "uniqueArray": [1, 2, 3, 4, 5, 6, 8, 9]
}
```

### Endpoint 2: `/external-data`
Método: `GET`
Descrição: Consulta um serviço externo e retorno de dados integrados. Simule uma requisição de um serviço GraphQL ou REST, escolhendo um deles na implementação (o candidato pode escolher qual usar). Retorne os dados tratados no formato JSON.
Serviços sugeridos:
- [GraphQL](https://pokeapi.co/docs/graphql)
- [REST](https://pokeapi.co/docs/v2)

## Requisitos Técnicos
Deve conter pelo menos um middleware de validação para garantir que:
- O array do endpoint /unique-array é válido (ex.: não deve aceitar strings ou arrays vazios).
- Para isso /external-data, simule a resposta com uma função assíncrona.
- Implementar testes unitários para os endpoints.

## Pontos Extras
- Implementar ci/cd.
- Implementar cache para o endpoint /external-data.
- Implementação de build de imagem docker
- Implementação de acesso a serviço [SOAP](https://github.com/MikeCastillo1/soap-pokemon)

