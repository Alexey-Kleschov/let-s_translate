import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {OrderInterface} from 'src/app/_shared/interface/order.interface';
import {CommentsInterface} from 'src/app/_shared/interface/comments.interface';
import {OrderService} from '../../_shared/service/order/order.service';
import {MessagesService} from '../../_shared/service/messages/messages.service';
import {AuthService} from '../../_shared/service/users/auth.service';
import * as moment from 'moment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFirestore} from '@angular/fire/firestore';


@Component({
  selector: 'app-text-details',
  templateUrl: './text-details.component.html',
  styleUrls: ['./text-details.component.css', '../../app.component.css']
})
export class TextDetailsComponent implements OnInit {
  progressBar = false;
  private id: number;
  private routeSubscription: Subscription;
  element: OrderInterface;
  incomingComments: CommentsInterface[];
  role: string;
  saveProgressBtn = false;
  textUrl: string;
  myId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService,
    private messagesService: MessagesService,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    // tslint:disable-next-line:variable-name
    private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.progressBar = true;
    this.role = this.authService.getRole();
    this.myId =  this.authService.getUserId();
    this.routeSubscription = this.route.params.subscribe(params => this.id = params.id);
    this.orderService.getOrder(this.id).subscribe((order: OrderInterface) => {
      console.log(order);
      this.element = order;
      this.messagesService.getMessages(this.element.id).subscribe((data: any) => {
        if (data.length) {
          this.incomingComments = [];
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < data.length; i++) {
            this.incomingComments.push(data[i]);
          }
        } else { console.log('empty db'); }
      });
    });
    this.progressBar = false;
  }

  getRelativeDate(i) {
    const commentDate = new Date(this.incomingComments[i].date);
    return moment(commentDate).fromNow();
  }

  sendComment(textarea) {
    this.progressBar = true;
    const text = textarea.value;
    // console.log(text);
    const role = this.authService.getRole();
    const message = {
      senderEmail: ' ',
      role,
      idCommentator: this.authService.getUserId(),
      idOrder: this.element.id,
      name: JSON.parse(localStorage.getItem('currentUser')).name,
      message: text,
      date: Date.now(),
      isFile: false
    };
    this.messagesService.createMessage(message).subscribe(() => {
      this.messagesService.getMessages(this.element.id).subscribe((data: any) => {
        const item = data.length - 1;
        if (!this.incomingComments) { this.incomingComments = []; }
        this.incomingComments.push(data[item]);
      });
    });
    textarea.value = '';
    this.progressBar = false;
    console.log(this.incomingComments)
  }

  sendLink(link) {
    this.progressBar = true;
    const text = link;
    const role = this.authService.getRole();
    const message = {
      senderEmail: ' ',
      role,
      idCommentator: this.authService.getUserId(),
      idOrder: this.element.id,
      name: JSON.parse(localStorage.getItem('currentUser')).name,
      message: text,
      date: Date.now(),
      isFile: true
    };
    this.messagesService.createMessage(message).subscribe(() => {
      this.messagesService.getMessages(this.element.id).subscribe((data: any) => {
        const item = data.length - 1;
        if (!this.incomingComments) { this.incomingComments = []; }
        this.incomingComments.push(data[item]);
        console.log(data);
      });
    });
    this.progressBar = false;
    console.log(this.incomingComments)
  }


  changeSliderTranslator(val) {
    this.element.progress = val;
    this.saveProgressBtn = true;
  }

  changeSliderCustomer(val) {
    this.element.price = val;
    this.saveProgressBtn = true;
  }

  savePrice() {
    this.progressBar = true;
    this.orderService.changePrice(this.element.id, this.element.price).subscribe((data) => {
      this._snackBar.open('The price was successfully changed', '', {
        duration: 2000,
      });
    });
    this.progressBar = false;
  }

  saveProgress() {
    this.progressBar = true;
    this.orderService.changeProgress(this.element.id, this.element.progress).subscribe((data) => {
      this._snackBar.open('The progress was successfully changed', '', {
        duration: 2000,
      });
    });
    this.progressBar = false;
  }

  reviewDone() {
    this.progressBar = true;
    this.orderService.reviewDone(this.element.id).subscribe((data) => {
      this._snackBar.open('Additional review is done!', '', {
        duration: 2000,
      });
    });
    this.progressBar = false;
  }

  customerReviewDone() {
    this.progressBar = true;
    this.orderService.customerReviewDone(this.element.id).subscribe((data) => {
      this._snackBar.open('Customer review is done!', '', {
        duration: 2000,
      });
    });
    this.progressBar = false;
  }

  deleteText() {
    this.progressBar = true;
    const orderId = this.element.id;
    this.orderService.deleteOrder(orderId).subscribe(res => {
      this.router.navigate(['dashboard']);
    });
    this.progressBar = false;
  }

  upload(event: Event) {
    this.progressBar = true;
    const file = (event.target as HTMLInputElement).files[0];
    const path = `photos/${Date.now()}_${file.name}`;
    const ref = this.storage.ref(path);
    const task = this.storage.upload(path, file);
    task.snapshotChanges().pipe(
      finalize(() => {
          const url = ref.getDownloadURL();
          url.subscribe(urlRes => {
            this.textUrl = urlRes;
            this.sendLink(this.textUrl)
            this._snackBar.open('The document was successfully uploaded', '', {
              duration: 2000,
            });
          });
        }
      )
    ).subscribe();
    this.progressBar = false;
  }

}
