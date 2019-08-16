<template>
    <div class="flex flex-1 flex-col rtl-direction">
        <div class="fixed flex m-3">
            <a
                href="https://github.com/Jensui/is.shekem.online"
                target="_blank"
            >
                <div
                    class="flex flex-1 rounded-full p-1 bg-grey-lighter border border-grey-light cursor-pointer"
                >
                    <img :src="require('~/assets/images/github.png')" />
                </div>
            </a>
        </div>
        <section class="flex flex-1 flex-col container">
            <div class="w-3/4 py-12">
                <div class="flex flex-row justify-center mb-2">
                    <span class="text-4xl text-black">תגיד/י השק"ם פתוח?</span>
                </div>
                <div class="flex flex-col p-2 items-center justify-center mb-6">
                    <div
                        class="flex bg-grey-lighter items-center justify-center rounded-full mb-3"
                        style="height: 168px; width: 168px;"
                    >
                        <fa
                            v-if="recent"
                            :icon="recent.state ? 'check' : 'times'"
                            :class="recent.state ? 'text-green' : 'text-red'"
                            style="font-size: 128px;"
                        />
                    </div>
                    <div
                        v-if="recent"
                        class="flex flex-col justify-center items-center"
                    >
                        <div class="flex flex-row">
                            <span>דווח על ידי&nbsp;</span>
                            <b>{{ recent.name }}</b>
                        </div>
                        <b
                            class="my-1"
                            :class="recent.state ? 'text-green' : 'text-red'"
                            >{{ fromNow(recent.createdAt) }}</b
                        >
                        <div
                            class="flex flex-row mt-2 bg-grey-lighter rounded items-center justify-center cursor-pointer"
                        >
                            <div
                                class="flex flex-1 p-2 px-4 items-center rounded-r hover:bg-red-light hover:text-white"
                                :class="
                                    recent.vote === -1
                                        ? 'bg-red-light text-white'
                                        : 'text-red'
                                "
                                @click="vote(recent.vote === -1 ? 0 : -1)"
                            >
                                <span class="ml-2">{{
                                    recent.score.negative
                                }}</span>
                                <fa icon="thumbs-down" />
                            </div>
                            <div
                                class="flex flex-1 border-grey p-2 px-4 items-center rounded-l hover:bg-green-light hover:text-white"
                                :class="[
                                    recent.vote === 1
                                        ? 'bg-green-light text-white'
                                        : 'text-green',
                                    recent.vote !== 0
                                        ? 'border-grey-lighter'
                                        : ''
                                ]"
                                @click="vote(recent.vote === 1 ? 0 : 1)"
                            >
                                <span class="ml-2">{{
                                    recent.score.positive
                                }}</span>
                                <fa icon="thumbs-up" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col mb-6">
                    <div
                        class="flex justify-right items-center pb-2 pr-1 text-sm"
                    >
                        <fa icon="plus" class="ml-2" />
                        <span>צור דיווח חדש</span>
                    </div>
                    <div
                        class="flex flex-1 flex-col bg-grey-lighter p-6 rounded shadow"
                    >
                        <div class="flex flex-1 flex-row mb-2">
                            <input
                                v-model="name"
                                type="text"
                                class="border flex flex-1 p-2 shadow text-right rounded px-3"
                                placeholder="שם מדווח"
                            />
                        </div>
                        <div
                            class="flex flex-1 flex-row items-center justify-center"
                        >
                            <input
                                type="button"
                                class="bg-green border-none p-2 rounded text-white cursor-pointer shadow flex flex-1 justify-center ml-2"
                                :class="!loading || 'bg-green-lighter'"
                                :disabled="loading"
                                value="פתוח"
                                @click="report(true)"
                            />
                            <input
                                type="button"
                                class="bg-red border-none p-2 rounded text-white cursor-pointer shadow flex flex-1 justify-center"
                                :class="!loading || 'bg-red-lighter'"
                                :disabled="loading"
                                value="סגור"
                                @click="report(false)"
                            />
                        </div>
                    </div>
                </div>
                <div class="flex flex-col">
                    <div
                        class="flex justify-right items-center pb-2 pr-1 text-sm"
                        border-r
                    >
                        <fa icon="list" class="ml-2" />
                        <span>דיווחים אחרונים</span>
                    </div>
                    <div
                        class="flex flex-1 flex-col bg-grey-lighter p-6 rounded shadow"
                    >
                        <div
                            v-for="entry in entries"
                            :key="entry.id"
                            class="flex mb-2 border-b p-2"
                        >
                            <div
                                class="w-4 flex justify-center items-center ml-2"
                            >
                                <fa
                                    :icon="entry.state ? 'check' : 'times'"
                                    :class="
                                        entry.state ? 'text-green' : 'text-red'
                                    "
                                />
                            </div>
                            <div class="flex flex-1 items-center">
                                <span>{{ entry.name }}</span>
                            </div>
                            <div class="flex items-center">
                                <div
                                    class="flex flex-row rounded items-center justify-center"
                                >
                                    <div
                                        class="flex flex-1 px-2 items-center text-red"
                                    >
                                        <span class="ml-2">{{
                                            entry.score.negative
                                        }}</span>
                                        <fa icon="thumbs-down" />
                                    </div>
                                    <div
                                        class="flex flex-1 border-grey px-2 items-center text-green"
                                    >
                                        <span class="ml-2">{{
                                            entry.score.positive
                                        }}</span>
                                        <fa icon="thumbs-up" />
                                    </div>
                                </div>

                                <b class="text-sm text-grey-darker mr-3">{{
                                    fromNow(entry.createdAt)
                                }}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
let moment = require('moment');
moment.locale('he');

export default {
    data() {
        return {
            name: '',
            loading: false,
            entries: []
        };
    },
    computed: {
        recent() {
            return this.entries[0];
        }
    },
    mounted() {
        this.name = localStorage.getItem('report:name') || '';

        this.update();
        setInterval(() => this.update(), 61000);
    },
    methods: {
        async update() {
            try {
                let response = await this.$axios.get('/api/v1/reports');
                if (
                    response.status === 200 &&
                    response.data.type === 'success'
                ) {
                    this.entries = response.data.data.entries;
                }
            } catch (e) {
                console.error(e);
            }
        },
        async vote(state) {
            try {
                let response = await this.$axios.post(`/api/v1/vote/${state}`);
                if (
                    response.status === 200 &&
                    response.data.type === 'success'
                ) {
                    this.entries = response.data.data.entries;
                }
            } catch (e) {
                console.error(e);
            }
        },
        async report(state) {
            try {
                this.loading = true;
                localStorage.setItem('report:name', this.name);

                let response = await this.$axios.post('/api/v1/report', {
                    name: this.name,
                    state
                });
                this.loading = false;
                if (
                    response.status === 200 &&
                    response.data.type === 'success'
                ) {
                    this.entries.unshift(response.data.data.entry);
                    if (this.entries.length > 5) {
                        this.entries.pop();
                    }
                }
                this.$toast.global[response.data.message]();
            } catch (e) {
                console.error(e);
                this.loading = false;
            }
        },
        fromNow(date) {
            return moment(date).fromNow();
        }
    }
};
</script>

<style>
.container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
