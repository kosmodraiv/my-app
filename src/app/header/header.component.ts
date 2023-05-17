import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';

interface CurrencyRate {
  rate: number;
  cc: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  rates: { [currency: string]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRates();
  }

  fetchRates() {
    const url = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

    this.http.get<CurrencyRate[]>(url).pipe(
      map((response: CurrencyRate[]) => {
        const filteredRates = response.map(({ rate, cc }: CurrencyRate) => ({ currency: cc, rate: rate }));
        const formattedRates = filteredRates.reduce((acc: { [currency: string]: number }, { currency, rate }) => {
          acc[currency] = rate;
          return acc;
        }, {});

        const uahRate = 1;
        formattedRates['UAH'] = uahRate;

        this.rates = formattedRates;
        console.log(formattedRates)
      }),
      catchError(error => {
        console.warn(error);
        alert('Не удалось получить информацию');
        return throwError(error);
      })
    ).subscribe(() => {
      this.onChangeToPrice(1);
    });
  }

  onChangeToPrice(price: number) {
    // Ваша логика при изменении цены
  }


}
