import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { LoginService } from './login.service'
import { Subscription } from 'rxjs/Subscription'


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit, OnDestroy {

  private subcriber: Subscription;
  loginFormGroup : FormGroup;

  constructor(public router: Router, public loginService: LoginService, private _formBuilder: FormBuilder, public httpAPI: HttpClient ) { 
   }

  ngOnInit() {
    this.loginFormGroup = this._formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    })

  }

  loginSubmit(data) {
    this.subcriber = this.loginService.login(data)
    .subscribe(
      (data) => {
        console.log(data)
        this.router.navigate(['/dashboard']);
      },
      (err) => console.log(err),
      () => console.log("DONE")
    )
  }

  ngOnDestroy() {
    this.subcriber.unsubscribe();
  }
}
