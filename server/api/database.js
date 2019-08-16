import Sequelize from 'sequelize';

import debug from 'debug';
let log = debug('app:database');

class Entry extends Sequelize.Model {
    getScore() {
        return this.votes.reduce(
            (score, vote) => {
                if (vote.score === 1) {
                    score.positive++;
                }
                if (vote.score === -1) {
                    score.negative++;
                }
                return score;
            },
            {
                positive: 0,
                negative: 0
            }
        );
    }

    public(ip) {
        let entry = this.toJSON();
        entry.score = this.getScore();
        if (ip) {
            let vote = entry.votes.find(vote => vote.ip === ip);
            entry.vote = vote ? vote.score : 0;
        }
        delete entry.votes;
        delete entry.ip;
        return entry;
    }
}

export let models = () => {
    return {
        Entry
    };
};

export let connect = async () => {
    log('attempting database connection: %o', process.env.DATABASE_URL);
    let database = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production'
        },
        logging: false
    });
    log('successfully connected to database');

    Entry.init(
        {
            name: Sequelize.STRING,
            ip: Sequelize.STRING,
            state: Sequelize.BOOLEAN,
            votes: Sequelize.JSON
        },
        { sequelize: database, modelName: 'entry' }
    );
    log('initialized database models');

    log('starting database sync');
    await database.sync();
    log('successfully synced database');

    return database;
};
