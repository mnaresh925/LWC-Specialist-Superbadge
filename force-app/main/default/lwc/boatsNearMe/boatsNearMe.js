import { LightningElement, wire, track, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
    @api
    boatTypeId;
    @track
    mapMarkers = [];
    @track
    isLoading = true;
    @track
    isRendered;
    @track
    latitude;
    @track
    longitude;

    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({ error, data }) {
        if (data) {
            this.createMapMarkers(data);
        } else if (error) {
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
        }
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser();
            this.isRendered = true;
        }
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        navigator.geolocation.getCurrentPosition(position => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
        })
    }

    // Creates the map markers
    createMapMarkers(boatData) {
        // const newMarkers = boatData.map(boat => {...});
        // newMarkers.unshift({...});
        this.mapMarkers = JSON.parse(boatData).map(boat => {
            let rObj = {}
            rObj.title = boat.Name,
                rObj.location = {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                }
            return rObj;
        });
        this.mapMarkers.unshift({
            title: LABEL_YOU_ARE_HERE,
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            icon: ICON_STANDARD_USER
        })
        this.isLoading = false;
    }
}