import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../../common/services/user.service";
import {LocalStorageService} from "../../../common/services/local-storage.service";
import {LoaderService} from "../../../common/services/loader.service";
import {GoogleAuth} from "@codetrix-studio/capacitor-google-auth";
import {ToasterService} from "../../../common/services/toaster.service";
import {CommonService} from "../../../common/services/common.service";
import {Share} from "@capacitor/share";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  avatarImg: string | undefined;
  userInfo: any
  public alertButtons = [
    {
      text: 'Ponisti',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'Obrisi',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private loaderService: LoaderService,
              private toasterService: ToasterService,
              private commonService: CommonService,
              private localStorageService: LocalStorageService,
  ) {
    this.avatarImg = 'https://ionicframework.com/docs/img/demos/avatar.svg'

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getUserData();
    })
  }

  getUserData() {
    this.loaderService.showLoader();
    let email = this.localStorageService.getUserEmail()
    this.userService.getUserDataByEmail(email).subscribe({
      next: (r) => {
        console.log('r', r)
        this.userInfo = r.value
        if (r.value.profilePicture) {
          this.avatarImg = r.value.profilePicture
        }
        this.loaderService.hideLoader();
      }, error: (err) => {
        this.loaderService.hideLoader();

      }
    })
  }

  deleteAccount(ev: any) {
    if (ev.detail.role === 'confirm') {
      this.loaderService.showLoader();
      let userEmail = this.localStorageService.getUserEmail()

      this.userService.deleteAccount(userEmail).subscribe({
        next: (r) => {
          GoogleAuth.signOut();
          this.localStorageService.clearLocalStorage();
          this.commonService.goToRoute('');
          this.toasterService.presentToast('Nalog uspesno obrisan', 'success');
          this.loaderService.hideLoader();
        }, error: (err) => {
          this.loaderService.hideLoader();
          this.toasterService.presentToast('Doslo je do greske', 'danger');
        }
      })
    }
  }
  async addPartner() {
    let partnerId = this.localStorageService.getUserId()
    await Share.share({
      title: 'Svet za nas',
      text: 'Hej, zelim da koristis svet za nas aplikaciju zajedno sa mnom',
      url: `https://svet-za-nas.wedosoftware.eu/${partnerId}`,
      dialogTitle: 'Svet za nas',
    });
  }
  goBack() {
    this.commonService.goToRoute('home/profile')
  }

}

