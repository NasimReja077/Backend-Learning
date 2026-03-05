import axios from "axios"

const BASE_URL = "https://www.dragonball-api.com/api"

export const getCharacters = async () => {

   const response = await axios.get(`${BASE_URL}/characters`)

   return response.data
}