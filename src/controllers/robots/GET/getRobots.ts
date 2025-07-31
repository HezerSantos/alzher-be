import { RequestHandler } from "express";

const getRobots: RequestHandler = (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.type("text/plain")
    res.send('User-agent: *\nDisallow: /');
}

export default getRobots