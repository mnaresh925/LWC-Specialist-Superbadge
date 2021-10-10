import { LightningElement, wire, api, track } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    @track
    boatId;
    @track
    error;
    @track
    boatReviews;
    @track
    isLoading;

    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
        return (this.boatId);
    }
    set recordId(value) {
        //sets boatId attribute
        //sets boatId assignment
        //get reviews associated with boatId
        this.setAttribute('boatId', value);
        this.boatId = value;
        this.getReviews();
    }

    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        if (this.boatReviews && this.boatReviews.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
    }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (!this.boatId) {
            return;
        }
        this.isLoading = true;
        getAllReviews({ boatId: this.boatId })
            .then((result) => {
                this.boatReviews = result;
                this.error = undefined;
                this.isLoading = false;
            })
            .catch((error) => {
                this.boatReviews = undefined;
                this.error = error;
                this.isLoading = false;
            })
    }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.getAttribute('data-record-id'),
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }
}