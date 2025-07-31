import express from 'express'

const bodyParser = [
    express.urlencoded({extended: true}),
    express.json()
]

export default bodyParser