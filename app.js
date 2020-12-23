require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const movieData= require('./movies-data.json')

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting));

app.use(cors())
app.use(helmet())


app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next()
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })

app.get('/movie', (req,res)=>{

    const {genre ="", country="", average_vote= ""} = req.query

    //string to float
    const avgVoteFloat = parseFloat(average_vote)

    //query param string trim/lowercase setup
    const countryQueryParam = country.trim();

    //lower/trim string then uppercase first letter == movie data store format
    let genreQueryParam= genre.trim();

    const possibleGenres = [];
    movieData.map( movie => {
        //empty object, if value is at index position true, then returns that genre value to the possibleGenres object
        possibleGenres[movie.genre] = true   
    });

    let data = movieData

    // unhappy case: genre query param
    if(genre && !genreQueryParam){
            return res
                .status(404)
                .send('Please select a genre such as Action, Adventure, Comedy, Thriller')
    }
    //happy case to GET genre data
    else if (genre){
       data = data.filter(movie => movie.genre.toLowerCase().includes(genreQueryParam.toLowerCase()))
    }
    

    // unhappy case: country query param
    if(country && !countryQueryParam){
            return res
                .status(404)
                .send('Please select available country such as United States, Italy, France, Great Britain')
    }
    //happy case to GET country data
    else if(country){
        data = data.filter( movie => movie.country.toLowerCase().includes(countryQueryParam.toLowerCase()));
    }


    // unhappy case: average vote
    if(average_vote && Number.isNaN(avgVoteFloat)){
            return res
                .status(404)
                .send('average vote must be a number')           
    }
    // happy case to GET vote data
    else if(average_vote){
        data = data.filter(movie => movie.avg_vote >= avgVoteFloat )
    }

    //happy basic response: no optional query params
        return res.json(data)
    
})


module.exports = app