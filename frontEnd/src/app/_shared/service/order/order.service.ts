import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../users/auth.service';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient,
    private authService: AuthService) {
  }

  private URL = environment.apiURI;

  deleteOrder(orderId: number) {
    return this.http.delete(`${this.URL}/secure/order/${orderId}`);
  }

  createOrder(order) {
    return this.http.post(`${this.URL}/secure/order/`, order);
  }

  getOrders() {
    const id = this.authService.getUserId();
    return this.http.get(`${this.URL}/secure/orders?idCustomer=` + id);
  }

  getUnownedOrders() {
    const idTranslator = this.authService.getUserId();
    return this.http.get(`${this.URL}/secure/orders/unowned?idTranslator=` + idTranslator);
  }

  getOrder(id: number) {
    return this.http.get(`${this.URL}/secure/order/${id}`);
  }

  getFilteredOrder(tags) {
    const idTranslator = this.authService.getUserId();
    const params = new HttpParams()
      .set('tags', tags)
      .set('idTranslator', String(idTranslator));
    return this.http.get(`${this.URL}/secure/order/filter`, {params});
  }

  getTranslatedOrders() {
    const idTranslator = this.authService.getUserId();
    return this.http.get(`${this.URL}/secure/orders/translate/` + idTranslator);
  }

  acceptOrder(idOrder: number, idTranslator: number, isCollection: boolean) {
    return this.http.post(`${this.URL}/secure/accept`,
      {idOrder, idTranslator, isCollection});
  }

  changeProgress(id, progress) {
    return this.http.put(`${this.URL}/secure/order/`, {id, progress});
  }

  reviewDone(id) {
    return this.http.put(`${this.URL}/secure/order-review/`, {id});
  }

  customerReviewDone(id) {
    return this.http.post(`${this.URL}/secure/review/done/`, {id});
  }

  changePrice(id, price) {
    return this.http.put(`${this.URL}/secure/price/`, {id, price});
  }

}
