import morgan from 'morgan';
import express from 'express';
import * as joi from 'joi';
import moment from 'moment';
import { Op } from 'sequelize';
import debug from 'debug';

import * as database from './database';

let log = debug('app:server');

let app = express();

app.use(express.json());

database.connect().then(instance => {
    let models = database.models();

    const report = joi.object().keys({
        name: joi
            .string()
            .min(3)
            .max(24)
            .required(),
        state: joi.bool().required()
    });

    app.use((req, res, next) => {
        res.locals.ip =
            req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress;
        log('request ip: %o', req.ip);
        return next();
    });

    app.post('/report', async (req, res, next) => {
        try {
            let { Entry } = models;

            const validated = await report.validate(req.body);
            if (validated) {
                let { ip } = res.locals;

                let spam = await Entry.findOne({
                    where: {
                        ip,
                        createdAt: {
                            [Op.gte]: moment()
                                .subtract(30, 'minutes')
                                .toDate()
                        }
                    }
                });
                if (!spam) {
                    let entry = await Entry.create({
                        name: validated.name,
                        ip,
                        state: validated.state,
                        votes: [{ ip, score: 1 }]
                    });

                    return res.json({
                        type: 'success',
                        message: 'ENTRY_CREATED',
                        data: {
                            entry: entry.public(ip)
                        }
                    });
                }
                return res.json({
                    type: 'error',
                    message: 'ENTRY_BLOCKED',
                    data: {
                        ip
                    }
                });
            }
            return res.json({
                type: 'error',
                message: 'ENTRY_DENIED'
            });
        } catch (e) {
            next(e);
        }
    });

    app.get('/reports', async (req, res, next) => {
        try {
            let { Entry } = models;

            let entries = await Entry.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']]
            });
            if (entries) {
                let { ip } = res.locals;

                return res.json({
                    type: 'success',
                    message: 'ENTRIES_FETCHED',
                    data: {
                        entries: entries.map(entry => entry.public(ip))
                    }
                });
            }
            return res.json({
                type: 'error',
                message: 'ENTRIES_DENIED'
            });
        } catch (e) {
            next(e);
        }
    });

    app.post('/vote/:score', async (req, res, next) => {
        try {
            let score = req.params.score ? Number(req.params.score) || 0 : 0;

            let { Entry } = models;
            let entry = await Entry.findOne({
                order: [['createdAt', 'DESC']]
            });
            if (entry) {
                let { ip } = res.locals;

                let votes = [...entry.votes];
                let vote = votes.find(vote => vote.ip === ip);
                if (vote) {
                    vote.score = score;
                } else {
                    votes.push({
                        ip,
                        score: score
                    });
                }
                await Entry.update(
                    {
                        votes
                    },
                    {
                        where: {
                            id: entry.id
                        }
                    }
                );

                let pub = entry.public();
                pub.vote = score;

                let entries = await Entry.findAll({
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                });

                return res.json({
                    type: 'success',
                    message: 'VOTE_RECEIVED',
                    data: {
                        entry: pub,
                        entries: entries.map(entry => entry.public(ip))
                    }
                });
            }
            return res.json({
                type: 'error',
                message: 'VOTING_DENIED'
            });
        } catch (e) {
            next(e);
        }
    });
});

app.use(
    morgan('combined', {
        stream: { write: msg => log(msg.trim()) }
    })
);

export default {
    path: '/api/v1',
    handler: app
};
