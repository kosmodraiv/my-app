import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';

interface CurrencyRate {
  rate: number;
  cc: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  defaultCurrencies = ['UAH', 'USD', 'EUR'];

  fromCurrency: string = 'UAH';
  toCurrency: string = 'USD';

  fromPrice: number = 0;
  toPrice: number = 1;

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

  onCurrencyChange(target: string) {
    if (target === 'from') {
      this.onChangeFromPrice(this.fromPrice);
    } else if (target === 'to') {
      this.onChangeToPrice(this.toPrice);
    }
  }


  onChangeFromPrice(value: number) {
    const price = value * this.rates[this.fromCurrency];
    const result = price / this.rates[this.toCurrency];
    this.fromPrice = +value.toFixed(3);
    this.toPrice = +result.toFixed(3);
  }

  onChangeToPrice(value: number) {
    const price = value / this.rates[this.fromCurrency];
    const result = price * this.rates[this.toCurrency];
    this.fromPrice = +result.toFixed(3);
    this.toPrice = +value.toFixed(3);
  }

}
