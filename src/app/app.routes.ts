/**
 * Created by wangdi on 26/5/17.
 */
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { ProductComponent } from './dashboard/products/product.component';
import { EngineComponent } from './dashboard/engines/engine.component';
import { DeviceComponent } from './dashboard/devices/device.component';

import { NotificationComponent } from './dashboard/notification/notification.component';
import { SweetAlertComponent } from './dashboard/sweetalert/sweetalert.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { PriceTableComponent } from './dashboard/component/pricetable/pricetable.component';
import { PanelsComponent } from './dashboard/component/panels/panels.component';
import { WizardComponent } from './dashboard/products/wizard/wizard.component';

import { RootComponent } from './dashboard/root/root.component';
import { LoginComponent } from './page/login/login.component';
import { LockComponent } from './page/lock/lock.component';
import { RegisterComponent } from './page/register/register.component';

const routes: Routes = [
  { path: '', redirectTo: '/login',  pathMatch: 'full' },
  { path: 'lock', component: LockComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register',  component: RegisterComponent },
  {
    path: 'dashboard', component: RootComponent, children: [
      { path: '', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'products',component: ProductComponent },
      { path: 'engines',component: EngineComponent },
      { path: 'devices',component: DeviceComponent },
      { path: 'notification', component: NotificationComponent },
      { path: 'alert', component: SweetAlertComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'components/price-table', component: PriceTableComponent },
      { path: 'components/panels', component: PanelsComponent },
    ]
  }
];

export const routing = RouterModule.forRoot(routes, {useHash: true});

