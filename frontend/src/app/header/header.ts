import { Component } from '@angular/core';
import { Navigation } from './navigation/navigation';
import { CallToAction } from './call-to-action/call-to-action';

@Component({
  selector: 'app-header',
  imports: [Navigation, CallToAction],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {}