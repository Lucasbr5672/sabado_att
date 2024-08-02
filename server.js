import "dotenv/config";
import express from "express";
import mysql from "mysql2";
import {v4 as uuid4} from "uuid";

const PORT = process.env.PORT;

const app = express();

//Rceber dados em JSON
app.use(express.json())

//CRIAR conexão com o banco de dados
const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD, //sen@iDev77!.
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
});

//CONECTAR ao BANCO
conn.connect((err)=>{
    if(err){
        console.error(err)
    }
    console.log("MYSQL conectado!");
    app.listen(PORT, ()=>{
        console.log("Servidor on PORT"+PORT);
    });
    
});
app.get('/livros', (request, response) => {

    const sql = /*sql*/ `SELECT * FROM livros`
    conn.query(sql, (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livros"})
            return
        }
        const livros = data
        response.status(200).json(data)
    })
});

app.post("/livros", (request, response)=>{
    const { titulo, autor, ano_publicacao, genero, preco } = request.body

    //Validações

    if(!titulo){
        response.status(400).json({err:" livro é obrigatório"});
        return;
    }

    if(!autor){
        response.status(400).json({err:"O autor é obrigatório"});
        return;
    }

    if(!ano_publicacao){
        response.status(400).json({err:"O ano_publicação é obrigatório"});
        return;
    }

    if(!genero){
        response.status(400).json({err:"O genero é obrigatório"});
        return;
    }

    if(!preco){
        response.status(400).json({err:"O preço é obrigatório"});
        return;
    }

    //verificar se o livros não foi cadastrado
    const checkSql =  /*sql*/ `SELECT * FROM livros WHERE titulo = "${titulo}" AND autor ="${autor}" AND ano_publicacao = "${ano_publicacao}"`
    conn.query(checkSql, (err, data)=>{
        if (err) {
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livros"})
            return;
        }

        if(data.length > 0){
            response.status(409).json({err: "Livro já foi cadastrado"})
            return
        }

        //Cadastrar o livro
        const id = uuid4()
        const disponibilidade = 1
        const insertSql =/*sql*/ `INSERT INTO livros
        (livro_id, titulo, autor, ano_publicacao, genero, preco,
         disponibilidade)
        VALUES
        ("${id}", "${titulo}", "${autor}", "${ano_publicacao}", "${genero}", "${preco}", "${disponibilidade}")
        `;
        conn.query(insertSql, (err)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao cadastrar livro"})
                return
            }
            response.status(201).json({message: "Livro Cadastrado"})
        })
    });
});

//Listar
app.get("/livros/:id", (request, response)=>{
    const {id} = request.params
    
    const sql =/*sql*/ `SELECT * FROM livros WHERE livro_id = "${id}" `;
    conn.query(sql, (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livro"})
            return
        }

        if(data.length === 0){
            response.status(404).json({err: "Livro não encontrado"})
            return
        }

        const livro = data[0]
        response.status(200).json(livro)
    })
})

//Atualizar
app.put("/livros/:id", (request, response)=>{
    const {id} = request.params
    const {titulo, autor, ano_publicacao, genero, preco, disponibilidade} = request.body

    
    if(!titulo){
        response.status(400).json({err:" livro é obrigatório"});
        return;
    }

    if(!autor){
        response.status(400).json({err:" O autor é obrigatório"});
        return;
    }

    if(!ano_publicacao){
        response.status(400).json({err:" O ano_publicação é obrigatório"});
        return;
    }

    if(!genero){
        response.status(400).json({err:"O genero é obrigatório"});
        return;
    }

    if(!preco){
        response.status(400).json({err:"O preço é obrigatório"});
        return;
    }

    if(disponibilidade === undefined){
        response.status(400).json({err: "A disponibilidade é obrigatório"})
        return;
    }

    const sql =/*sql*/ `SELECT * FROM livros WHERE livro_id = "${id}" `;
    conn.query(sql, (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livro"})
            return
        }

        if(data.length === 0){
            response.status(404).json({err: "Livro não encontrado"})
            return
        }

        const updateSql = /*sql*/ ` UPDATE livros SET titulo ="${titulo}", autor = "${autor}", ano_publicacao = "${ano_publicacao}", genero = "${genero}", preco = "${preco}", disponibilidade = "${disponibilidade}" where livro_id = "${id}"
        `
        conn.query(updateSql, (err, result, field)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao atualizar livro"})
                return
            }
            console.log(result)
            console.log(field)
            response.status(200).json({err: "Livro atualizado"})
        })
    })
})

//Delete
app.delete("/livros/:id", (request, response)=>{
    const {id} = require.params

    const deleteSql = /*sql*/ `delete from livros where livros_id = "${id}"`
    conn.query(deleteSql, (err, info)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao deletar livro"})
            return
        }
        if(info.affectedRows === 0){
            response.status(404).json({err: "Livro não encontrado"})
            return
        }
        response.status(200).json({err: "Livro deletado"})
    })
})

/*************** ROTAS DE FUNCIONARIOS ****************/
/** tabela (id, nome, cargo, data_contratacao, salario, email)
 * 1º listar todos os funcionarios
 * 2º cadastrar um funcionario (email é unico)
 * 3º Listar um funcionário
 * 4º Atualizar um funcionario (não poder ter o email de outro funcionario)
 * 5º Deletar um funcionario
 */

