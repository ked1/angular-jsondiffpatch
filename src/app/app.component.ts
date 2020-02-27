import { Component, OnInit } from "@angular/core";
import { Partner } from "./partner.model";
import { diff, Config, DiffPatcher, formatters, Delta } from "jsondiffpatch";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  partner: Partner = {
    personId: 1,
    lastname: "Meyer",
    firstname: "Marco",
    children: [
      { personId: 2, lastname: "Meyer", firstname: "Ladina", children: null },
      { personId: 3, lastname: "Meyer", firstname: "Curdin", children: null }
    ]
  };
  partnerAno: Partner;
  partnerChanged: Partner;
  partnerAnoPatched: Partner;
  anonymizationGapDiff: Delta;
  partnerAnonymized2: Partner;

  private jsondiffpatch = new DiffPatcher();

  anonymizationDiffDbDictionary: { [id: string]: Delta } = {}; // would be a documentDb in the reality

  private ngOnInit() {
    this.doAll();
  }

  anonymize() {
    this.partnerAno = this.anonymizePartner(this.partner);
  }

  diff() {
    const diff = this.jsondiffpatch.diff(this.partner, this.partnerAno);
    this.anonymizationDiffDbDictionary[this.partner.id] = diff;
  }

  change() {
    this.partnerChanged = JSON.parse(JSON.stringify(this.partner));
    this.partnerChanged.lastname = "Meier";
    this.partnerChanged.children.push({
      firstname: "David",
      lastname: "Meyer",
      children: [{ firstname: "Sina", lastname: "Meyer" }]
    });
    this.partnerChanged.children.push({
      firstname: "Caroline",
      lastname: "Meyer",
      children: null
    });
  }

  patch() {
    this.partnerAnoPatched = this.jsondiffpatch.patch(
      this.partnerChanged,
      this.anonymizationDiffDbDictionary[this.partner.id]
    );
  }

  checkAnonymization() {
    this.anonymizationGapDiff = this.jsondiffpatch.diff(
      this.partnerAno,
      this.partnerAnoPatched
    );
  }

  anonymizeNonAnonymizedAttributes() {
    // 1 - parse this.anonymizationGapDiff and anonymize the attributes
    // 2 - take diff between from this.partner (original) and this.partnerAnonymized2
    // 3 - replace diff in anonymizationDiffDictionary

    this.anonymizeRecursive(this.anonymizationGapDiff, this.partnerAnoPatched);

    // this.partnerAnonymized2. ... = this.getRandomFirstname();
  }

  anonymizeRecursive(diff: Delta, obj: Object) {
    if (typeof obj == "object") {
      for (let key of Object.keys(diff)) {
        console.log("key", key, diff[key]._t);
        if (diff[key]._t === "a") {
          for (let i in diff[key]) {
            // if (i !== "_t") {
            //   console.log("array item", i, diff[key][i][0]);
            //   console.log("obj", obj[key][i]);
            // }
            this.anonymizeRecursive(diff[key], obj[key][i]);
          }
        } else if (typeof diff[key] === "object") {
          console.log("anonymize", typeof diff[key], diff[key][0]);
          this.anonymizeRecursive(diff[key], obj[key]);
        }
      }
    }
  }

  private doAll() {
    this.anonymize();
    this.diff();
    this.change();
    this.patch();
    this.checkAnonymization();
    this.anonymizeNonAnonymizedAttributes();
  }

  private anonymizePartner(partner: Partner): Partner {
    let partnerClone = JSON.parse(JSON.stringify(partner));
    partnerClone.lastname = this.getRandomLastname();
    partnerClone.firstname = this.getRandomFirstname();
    partnerClone.children[0].lastname = this.getRandomLastname();
    partnerClone.children[0].firstname = this.getRandomFirstname();
    partnerClone.children[1].lastname = this.getRandomLastname();
    partnerClone.children[1].firstname = this.getRandomFirstname();
    return partnerClone;
  }

  private getRandomFirstname() {
    const firstnames = [
      "Daniel",
      "Silvan",
      "Stefan",
      "Francesco",
      "Sascha",
      "Florian",
      "Nella",
      "Beat",
      "Zoltan",
      "Marcel",
      "Filip",
      "Martin",
      "Vera",
      "Andreas",
      "René"
    ];
    return this.getRandomElementOfArray(firstnames);
  }

  private getRandomLastname() {
    const lastnames = [
      "Muster",
      "Müller",
      "Meyer",
      "Schwarz",
      "Weiss",
      "Keller",
      "Heinrich",
      "Gerster",
      "Suter",
      "Hartmann",
      "Lauber",
      "Inauen",
      "Miller",
      "Gallo",
      "Nef"
    ];
    return this.getRandomElementOfArray(lastnames);
  }

  private getRandomElementOfArray(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
}
