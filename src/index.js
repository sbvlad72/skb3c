import express from 'express';
import cors from 'cors';
//import bodyParser from 'body-parser';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import fs from 'fs';
const __DEV__ = false;

const baseUrl = 'https://pokeapi.co/api/v2';
const app = express();
//app.use(bodyParser.json());
app.use(cors());

async function getPokemons(url, i = 0) {
  console.log('getPokemons', url, i);
  const response = await fetch(url);
  const page = await response.json();
  const pokemons = page.results;
  if (__DEV__ && i > 3) {
  return pokemons;
  }
  if (page.next) {
    const pokemons2 = getPokemons(page.next, i + 1);
    return [
    ...pokemons,
    ...pokemons2
    ]
  }
  return pokemons;
}

// покемоны из урл
const pokemonsUrl = `${baseUrl}/pokemon`;
//getPokemons(pokemonsUrl).then(pokemons => {
//  console.log(pokemons.length);
//});

//покемоны из файла
const pokemons = JSON.parse(fs.readFileSync('./src/poke.json', 'utf8'));
console.log(pokemons.length);


/*
app.get('/', async (req, res) => {
  try {
    let sortedPok = _.sortBy(pokemons, ['name']);
    const respPok = _.map(sortedPok, 'name');
    res.status(200).json(respPok); 
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
});
*/

/*
fat - max(pokemon.weight / pokemon.height)
angular - min(pokemon.weight / pokemon.height)
heavy - max(pokemon.weight)
light - min(pokemon.weight)
huge - max(pokemon.height)
micro - min(pokemon.height)
*/
app.get(/(^\/fat)|(^\/angular)|(^\/heavy)|(^\/light)|(^\/huge)|(^\/micro)|(^\/)/, async (req, res) => {
  try {
console.log(req.path);
    const offset = req.query.offset != undefined ? req.query.offset : 0;
    const limit = req.query.limit != undefined ? req.query.limit : 20;
    const path = req.path;
console.log(path, 'offset=', offset, 'limit=', limit);
    // сформируем массив с метриками
    let arrPokMetrics = pokemons.slice(0);
//console.log('1 arrPokMetrics=', arrPokMetrics);
    let pokMetrics = {};
    for ( let i in arrPokMetrics ) {
//      pokMetrics = pokemins[i];
      arrPokMetrics[i].weight = +arrPokMetrics[i].weight;
      arrPokMetrics[i].height = +arrPokMetrics[i].height;
      arrPokMetrics[i]['fat'] = arrPokMetrics[i].weight / arrPokMetrics[i].height;
    };
//console.log('arrPokMetrics=', arrPokMetrics);
    
    // сортировка
    let sortedPok = [];
    switch (path) {
      case '/':
        sortedPok = _.sortBy(arrPokMetrics, ['name']);
        break;
      case '/fat':
        sortedPok = _.orderBy(arrPokMetrics, ['fat', 'name'], ['desc', 'asc']);
        break;
      case '/angular':
        sortedPok = _.sortBy(arrPokMetrics, ['fat', 'name']);
        break;
      case '/heavy':
        sortedPok = _.orderBy(arrPokMetrics, ['weight', 'name'], ['desc', 'asc']);
        break;
      case '/light':
        sortedPok = _.sortBy(arrPokMetrics, ['weight', 'name']);
        break;
      case '/huge':
        sortedPok = _.orderBy(arrPokMetrics, ['height', 'name'], ['desc', 'asc']);
        break;
      case '/micro':
        sortedPok = _.sortBy(arrPokMetrics, ['height', 'name']);
        break;
    };
//console.log(path, sortedPok);

    sortedPok = sortedPok.slice(offset, (+offset + +limit));
    const respPok = _.map(sortedPok, 'name');
    //res.status(200).json(sortedPok);
    res.status(200).json(respPok);
  } catch (err) {
    res.status(404).send('Not Found' + err); 
  }
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
