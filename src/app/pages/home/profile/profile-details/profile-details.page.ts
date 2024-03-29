import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NavController} from "@ionic/angular";
import {LoaderService} from "../../../../common/services/loader.service";
import {UserService} from "../../../../common/services/user.service";
import {LocalStorageService} from "../../../../common/services/local-storage.service";
import {Camera, CameraResultType} from "@capacitor/camera";
import {CommonService} from "../../../../common/services/common.service";

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.page.html',
  styleUrls: ['./profile-details.page.scss'],
})
export class ProfileDetailsPage implements OnInit {
  receivedObject: any;
  age: number | null = null;
  message: string = '';
  newPicture: string | undefined
  yearOld: any
  monthsOld: any
  weekPregnant: any
  link = ''
  baseLInk = ''


  constructor(private route: ActivatedRoute,
              private loaderService: LoaderService,
              private localStorageService: LocalStorageService,
              private userService: UserService,
              private commonService: CommonService,
              private router: Router,
              private navController: NavController
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.loaderService.showLoader();
      this.yearOld = 0
      this.monthsOld = 0
      this.weekPregnant = 0
      const encodedObject = params['data'];
      setTimeout(() => {
        this.loaderService.hideLoader();
      }, 100)
      this.receivedObject = JSON.parse(decodeURIComponent(encodedObject));
      this.calculateAgeOrPregnancy(this.receivedObject.dateOfBirth);
      console.log('received', this.receivedObject)
    });
  }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });
    if (image.dataUrl) {
      this.newPicture = image.dataUrl;
      this.changeUserImg();
    }
  };

  getEmailToSend() {
    if (this.receivedObject.parentRole) {
      return this.receivedObject.email
    } else {
      return this.localStorageService.getUserEmail()
    }

  }

  changeUserImg() {

    // @ts-ignore parentRole
    const profilePicture = this.newPicture.replace(/^data:image\/\w+;base64,/, '');
    const dataToSend = {
      email: this.getEmailToSend(),
      name: this.receivedObject.name,
      profilePicture: profilePicture,
      person: this.receivedObject.pets ? 2 : (this.receivedObject.parentRole ? 0 : 1),
    }
    this.userService.changeUserImg(dataToSend).subscribe({
      next(r) {

      }, error(err) {
        console.log('error while updating profile picture', err)
      }
    })
    console.log('received obj', this.receivedObject)
  }

  private calculateAgeOrPregnancy(dateString: string): void {
    const givenDate = new Date(dateString);
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    if (givenDate > currentDate) {
      const daysUntilDueDate = Math.floor((givenDate.getTime() - currentDate.getTime()) / oneDay);
      const weeksUntilDueDate = Math.floor(daysUntilDueDate / 7);
      const weeksPregnant = 40 - weeksUntilDueDate;
      this.message = `${weeksPregnant} nedelja trudnaoce`;
      this.weekPregnant = weeksPregnant;
    } else {
      const monthsOld = Math.floor((currentDate.getTime() - givenDate.getTime()) / (30 * oneDay));
      if (monthsOld < 12) {
        this.message = `${monthsOld} meseci`;
        this.monthsOld = monthsOld
      } else {
        let ageYears = currentDate.getFullYear() - givenDate.getFullYear();
        if (currentDate.getMonth() < givenDate.getMonth() ||
          (currentDate.getMonth() == givenDate.getMonth() && currentDate.getDate() < givenDate.getDate())) {
          ageYears--;
        }
        this.message = `${ageYears} godina`;
        this.yearOld = ageYears;
      }
    }
  }

  async generateLink() {
    // if (this.weekPregnant && this.weekPregnant > 0) {
    //   this.link = `${this.baseLInk}trudnoca/`
    //   //todo here goes else ifs for nedelje trudnoce
    // } else if (this.monthsOld && this.monthsOld > 0) {
    //   if (this.monthsOld >= 0 && this.monthsOld <= 3) {
    //     this.link = `${this.baseLInk}razvojna-mapa-0-3-meseca/`;
    //   } else if (this.monthsOld >= 4 && this.monthsOld <= 6) {
    //     this.link = `${this.baseLInk}razvojna-mapa-4-6-meseci/`;
    //   } else if (this.monthsOld >= 7 && this.monthsOld <= 9) {
    //     this.link = `${this.baseLInk}razvojna-mapa-7-9-meseci/`;
    //   } else if (this.monthsOld >= 10 && this.monthsOld <= 12) {
    //     this.link = `${this.baseLInk}razvojna-mapa-10-12-meseci/`;
    //   } else if (this.monthsOld >= 13 && this.monthsOld <= 18) {
    //     this.link = `${this.baseLInk}razvojna-mapa-13-18-meseci/`;
    //   } else if (this.monthsOld >= 19 && this.monthsOld <= 24) {
    //     this.link = `${this.baseLInk}razvojna-mapa-19-24-meseca/`;
    //   } else if (this.monthsOld >= 25 && this.monthsOld <= 36) {
    //     this.link = `${this.baseLInk}razvojna-mapa-25-36-meseci/`;
    //   } else {
    //     this.link = '';
    //   }
    // } else if (this.yearOld &&) {
    //   if (date >= 3 && date <= 4) {
    //     this.link = `${this.baseLInk}razvojna-mapa-3-4-godine/`;
    //   } else if (date >= 4 && date <= 5) {
    //     this.link = `${this.baseLInk}razvojna-mapa-4-5-godina/`;
    //   } else if (date >= 5 && date <= 6) {
    //     this.link = `${this.baseLInk}razvojna-mapa-5-6-godina/`;
    //   } else if (date >= 6 && date <= 7) {
    //     this.link = `${this.baseLInk}razvojna-mapa-6-7-godina/`;
    //   } else {
    //     this.link = '';
    //   }
    // }
    this.link = 'https://www.vijesti.me/'
    const queryParams = encodeURIComponent(JSON.stringify(this.link));
    await this.router.navigate(['home/in-app-browser'], {queryParams: {data: queryParams}});
  }

  isFutureDate(dateOfBirth: any): boolean {
    const currentDate = new Date();
    const targetDate = new Date(dateOfBirth);
    return targetDate > currentDate;
  }

  generateImg() {
    if (this.receivedObject?.profilePicture) {
      return this.receivedObject.profilePicture
    } else {
      if (this.receivedObject?.parentRole) {
        if (this.receivedObject?.parentRole === 'mom') {
          return './assets/images/mom.png'
        } else {
          return '/assets/images/dad.png'
        }
      } else if (this.receivedObject.gender) {
        if (this.isFutureDate(this.receivedObject.dateOfBirth)) {
          return '/assets/images/baby.png'
        } else {

          if (this.receivedObject.gender === 'boy') {
            return '/assets/images/boy.png'
          } else if (this.receivedObject.gender === 'girl') {
            return '/assets/images/girl.png'
          } else {
            return '/assets/images/baby.png'
          }
        }
      } else {
        return '/assets/images/pet.png'
      }
    }
  }


  goBack() {
    this.navController.navigateBack('home/profile')
  }
}
