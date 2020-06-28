import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountSettingsKey'
})
export class AccountSettingsKeyPipe implements PipeTransform {

  transform(value: string): string {
    let returnValue = value.split('_');
    returnValue = returnValue.map((word: string) => word[0].toUpperCase() + word.slice(1));
    return returnValue.join(' ');
  }
}
