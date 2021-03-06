if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../service-worker.js')
        .then(() => {
            console.log('Service Worker Registered')
        })
}

let Categories = {
    TODAS: 0,
    COMBOS: 1,
    BIBSFIHAS: 2,
    SALGADOS: 3
}

/*
| ================================================================================
| APP HEADER
| ================================================================================
*/

Vue.component('appHeader', {
    template: `
        <div class="m-appHeader">
            <button class="m-appHeader__menuHandle" :class="{'--active': modifier}" v-on:click.stop.prevent="onToggleDrawer"></button>
            <h1 class="m-appHeader__logo text-hide">
                <a href="./" class="m-appHeader__link" v-on:click.prevent>Habib's Cupons</a>
            </h1>
        </div>
    `,
    props: ['action', 'modifier'],
    methods: {
        onToggleDrawer() {
            this.action()
        }
    }
});

/*
| ================================================================================
| OFERTAS LIST
| ================================================================================
*/

Vue.component('ofertasList', {
    template: `
        <ul class="m-ofertasList">
            <li v-for="oferta in ofertas" class="m-ofertasList__item" v-on:click="onSelectOffer(oferta)">
                <img class="m-ofertasList__thumb" :src="oferta.thumb">
                <p class="m-ofertasList__description">{{oferta.titulo}}<strong class="m-ofertasList__preco"><sup><small>R$</small></sup>{{oferta.preco.tabelaA}}</strong></p>
            </li>
        </ul>
    `,
    props: ['ofertas', 'action'],
    methods: {
        onSelectOffer(offer) {
            this.action(offer)
        }
    }
});

/*
| ================================================================================
| NAVIGATION DRAWER
| ================================================================================
*/

Vue.component('navigationDrawer', {
    template: `
        <transition name="toggleDrawer">
            <div class="m-navigationDrawer">
                <div class="m-navigationDrawer__content">
                    <ul class="m-navigationDrawer__linksList">
                        <li class="m-navigationDrawer__item" v-for="category in categories">
                            <button class="m-navigationDrawer__itemButton" v-on:click="onSelect(category.index)">{{category.name}}</button>
                        </li>
                    </ul>
                    <button class="m-navigationDrawer__btnClose" v-on:click.stop.prevent="onToggleDrawer">X</button>
                </div>
            </div>
        </transition>
    `,
    props: ['categories', 'action', 'actionSelect'],
    methods: {
        onToggleDrawer() {
            this.action()
        },
        onSelect(category) {
            this.actionSelect(category);
        }
    }
});

/*
| ================================================================================
| OFFER DETAIL
| ================================================================================
*/

Vue.component('offerDetail', {
    template: `
        <transition name="toggleOffer">
            <div class="m-offerDetail" v-if="active">
                <div class="m-offerDetail__code">{{offer.id}}</div>
                <p class="m-offerDetail__description">{{offer.titulo}}</p>
                <p class="m-offerDetail__preco">{{offer.preco.tabelaA}}</p>
                <img class="m-ofertasList__thumb" :src="offer.thumb">
            </div>
        </transition>
    `,
    props: ['offer', 'active']
});

/*
| ================================================================================
| TOAST MESSAGE
| ================================================================================
*/

Vue.component('appToast', {
    template: `
        <transition name="toggleToast">
            <div class="m-appToast">{{message}}</div>
        </transition>
    `,
    props: ['message']
});

/*
| ================================================================================
| SPLASH SCREEN
| ================================================================================
*/

Vue.component('splashScreen', {
    template: `
        <transition name="toggleSplash">
            <div class="splashScreen">splashScreen</div>
        </transition>
    `
});

/*
| ================================================================================
| APP
| ================================================================================
*/

var app = new Vue({
    el: '.appRoot',
    data: {
        API_KEY: 'AIzaSyDFOzA7-cOFg0rhq_cuwv0PFiIGZwaOUqo',
        categories: [
            {name: 'Todas', index: Categories.TODAS},
            {name: 'Combos', index: Categories.COMBOS},
            {name: 'Bib\'sfihas', index: Categories.BIBSFIHAS},
            {name: 'Salgados', index: Categories.SALGADOS}
        ],
        ofertas: [],
        filteredOfertas: [],
        validade: null,
        isDrawerOpen: false,
        selectedOffer: null,
        isOfferSelected: false,
        isToastActive: false,
        toastMessage: '',
        isLoading: true,
    },
    methods: {
        toggleDrawer() {
            if (!this.isOfferSelected) {
                this.isDrawerOpen = !this.isDrawerOpen
            } else {
                this.isOfferSelected = !this.isOfferSelected
            }
        },
        showToast(message, lifeTime = 0) {
            this.toastMessage = message;
            this.isToastActive = true;
            setTimeout(() => {
                this.isToastActive = false;
            }, lifeTime)
        },
        selectOffer(offer) {
            this.isOfferSelected = true;
            this.selectedOffer = offer;
        },
        checkConnection() {
            let self = this;
            return new Promise((resolve, reject) => {
                if (navigator.onLine) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        },
        selectCategory(categoryId) {
            this.filterCategory(categoryId);
        },
        filterCategory(index) {
            let tmpOffers = this.ofertas.filter(function(item) {
                return item.categoria == index;
            });
            this.filteredOfertas = tmpOffers;

            if (index == Categories.TODAS) {
                this.filteredOfertas = this.ofertas;
            }

            this.toggleDrawer();
        },
        getGeo() {
            var geo_options = {
                enableHighAccuracy: false, 
                maximumAge        : 30000, 
                timeout           : 27000
            };
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    console.log('POSITION: ', position.coords);
                    let location = await this.getAddress(position.coords.latitude, position.coords.longitude);
                    console.log('LOCATION: ', location);
                    resolve(position);
                }, (err) => {
                    reject(err);
                }, geo_options);
            });
        },
        getAddress(latitude, longitude) {
            let APIUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.API_KEY}`;
            return new Promise((resolve, reject) => {
                fetch(APIUrl).then(response => {
                    response.json()
                    .then(data => {
                        let location = {
                            Endereço: data.results[0].formatted_address,
                            Cidade: data.results[0].address_components[4].long_name,
                            Estado: data.results[0].address_components[4].short_name
                        };
                        resolve(location);
                    }).catch(err => {
                        reject(err)
                    })
                })
            })
        }
    },
    created() {
        fetch('../data/ofertas.json', {mode: 'cors'})
        .then(result => {
            result.json()
            .then(data => {
                this.ofertas = data.ofertas;
                this.filteredOfertas = this.ofertas;
            })
        })
    },
    async mounted() {
        if(await this.checkConnection()) {
            await this.getGeo();
        } else {
            this.showToast('You are offline.', 3000);
        }

        this.isLoading = false;
    },
    template: `
        <div class="appContainer">
            <appHeader :action="toggleDrawer" :modifier="isOfferSelected"></appHeader>
            <div class="m-appBody">
                <ofertasList :ofertas="filteredOfertas" :action="selectOffer"></ofertasList>
            </div>
            <navigationDrawer :categories="categories" :actionSelect="selectCategory" v-if="isDrawerOpen" :action="toggleDrawer"></navigationDrawer>
            <offerDetail :active="isOfferSelected" :offer="selectedOffer"></offerDetail>
            <appToast :message="toastMessage" v-if="isToastActive"></appToast>
            <splashScreen v-if="isLoading"></splashScreen>
        </div>
    `
});