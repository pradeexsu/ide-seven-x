var request = require('request');
const express = require('express')
app = new express()

app.code=''
app.language=''
app.input=''
app.result={
    error:null,
    response:null,
    body:{
        cpuTime:'',
        output:'',
        statusCode:'',
        memory:''    
    }
}
// app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('view engine','ejs')


app.use(express.urlencoded({
    extended: true
  }))

app.get('/',(req,res)=>{
    res.render('home',{
        result:app.result,
        data:{
            input:app.input,
            code:app.code,
            language:app.language
        }
    }
    )
})

app.get('/about',(req,res)=>{
    res.render('about')
})

app.get('/api',(req,res)=>{
    res.render('api')
})

app.post('/running',(req,res)=>{
    app.language = req.body.language
    app.code = req.body.code
    app.input = req.body.input
    // console.log(
    //     app.language = req.body.language,
    //     app.code = req.body.code,
    //     app.input = req.body.input
        
    //     )
    Run()
    .then( () =>{
        res.redirect('/')
    })
    
    // res.result
})


const port = process.env.PORT ||3000;
app.listen(port,()=>console.log(`Listening on port ${port}`))


function Run(){
    var program = {
        clientId: "b39373de11efb44eb78dd9946a8e29d8",
        clientSecret:"c9bcc22ef5c05560da9d85752572c800c08c2bb480abc8538ccfccd4a5355ff8",
        script : app.code,
        stdin: app.input,
        language: app.language,
        versionIndex: 0
    };
    return new Promise((resolve,reject)=>{

        request({
            url: 'https://api.jdoodle.com/v1/execute',
            method: "POST",
            json: JSON.stringify(program)
        },
        function (error, response, body) {
            if(!error)
                resolve()
            else
                reject('Error is there, Some thing Went Wrong')
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
            app.result = {
                error: error,
                response: response,
                body: body
            };
        });
    })
        
    }