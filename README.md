<h1>Como rodar o sistema</h1>
<h2>Banco de dados</h2>
<p>Execute o arquivo .sql no seu mysql ou mariadb</p>
<h2>Servidor Web</h2>
:computer: COMO INSTALAR O SISTEMA

* Clone o repositório usando o seguinte comando:
```
git clone https://github.com/NunesGustavo0/Learn-TI.git
```
Copie e cole esse comando no terminal da sua maquina

* Instalando dependências:
```
npm install
```
Execute o comando npm install para instalar todas as dependências 

* Conectar com seu banco 
```
//Conexao com o banco dados
const sequelize = new Sequelize('learn_ti', 'NOME_DO_SEU_USUARIO', 'SENHA_DO_SEU_USUARIO', {
    host: "localhost",
    dialect: "mysql",
    timezone: '-04:00',
    dialectOptions: {
        useUTC: false,
        dateStrings: true,
        typeCast: true
    }
});
```
No arquivo conector.js, altere o código do conector, adicionando as informações do seu banco de dados mysql

* Navegue até o diretório do projeto
```
cd /codigos/learn_ti
```
* Executar servidor
```
node login.js
```
Após isso, execute o código login.js, é ele que contém todas as rotas do nosso servidor
