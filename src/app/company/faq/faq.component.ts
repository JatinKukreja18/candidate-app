import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
    constructor() {}
    ngOnInit(){
        document.querySelectorAll(".tabsLink").forEach(function(tbasTargeting){
            tbasTargeting.addEventListener("click", function(){
                var tabsSelected = document.querySelector(".active");
                if(tabsSelected){
                    tabsSelected.classList.remove("active");
                }
                this.classList.add("active");
            })
        })
    }
}