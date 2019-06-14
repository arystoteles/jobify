const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias
    })
})
app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+ request.params.id+';')
    response.render('vaga', {
        vaga
    })
})

app.get('/categoria/:id', async(req, res) => {
    const db = await dbConnection
    const categoria = await db.get('select * from categoria where id = '+ request.params.id +';')
    reponse.render('categoria', {
        categoria
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

//Gerenciamento de Vagas
app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', { vagas })
})
//Deletar Vagas
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+'')
    res.redirect('/admin/vagas')
})
//Adicionar Vagas
app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})
app.post('/admin/vagas/nova', async(req, res) => {
    const { titulo, descricao, categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria}, '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})
//Editar Vagas
app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+ req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})
app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { titulo, descricao, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
})

// Gerenciamento de Categorias
app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categorias', { categorias })
})
// Adicionar Categorias
app.get('/admin/categorias/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria', { categorias })
})
app.post('/admin/categorias/nova', async(req, res) => {
    const { titulo } = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values('${titulo}')`)
    res.redirect('/admin/categorias')
})
// Editar Categorias
app.get('/admin/categorias/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categoria = await db.get('select * from categorias where id = '+ req.params.id)
    res.render('admin/editar-categoria', { categoria })
})
app.post('/admin/categorias/editar/:id', async(req, res) => {
    const { titulo } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update categorias set categoria = '${titulo}' where id = ${id}`)
    res.redirect('/admin/categorias')
})
// Deletar Categorias
app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id = '+ req.params.id +'')
    res.redirect('/admin/categorias')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    const vaga = 'Marketing Digital(San Francisco)'
    const descricao = 'Vaga para fullstack developer que fez o Fullstack Lab'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)
}
init()
app.listen(3000, (err) => {
    if(err) {
        console.log('Não foi possível iniciar o servidor do Jobify.')
    } else {
        console.log('Servidor do Jobify rodando...')
    }
})

