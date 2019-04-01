import { Pipe, PipeTransform } from '@angular/core';

//Helpers

export function isUndefined(value: any) {
  return typeof value === 'undefined';
}
export function isObject(value: any) {
  return value !== null && typeof value === 'object';
}

export function extractDeepPropertyByMapKey(obj: any, map: string): any {
  const keys = map.split('.');
  const head = keys.shift();

  return keys.reduce((prop: any, key: string) => {
    return !isUndefined(prop) && !isUndefined(prop[key]) ? prop[key] : undefined;
  }, obj[head || '']);
}

//Pipes

@Pipe({ name: 'objectParser' })
export class ObjectParserPipe implements PipeTransform {
  transform(value): any {
    let keys = [];
    for (let key in value) {
      keys.push({ key: key, value: value[key] });
    }
    return keys;
  }
}

@Pipe({ name: 'splitComma' })
export class SplitCommaPipe implements PipeTransform {
  transform(value): any {
    let valArray = [];
    valArray = value.split(',');
    console.log(valArray);
    return valArray;
  }
}

@Pipe({ name: 'unique' })
export class UniquePipe implements PipeTransform {
  transform(input: any[], args?: string | undefined): any[];
  transform<T>(input: T, args?: string | undefined): T;

  transform(input: any, propertyName?: string | undefined): any {

    const uniques: boolean[] = [];

    return Array.isArray(input)
      ? isUndefined(propertyName)
        ? input.filter((e, i) => input.indexOf(e) === i)
        : input.filter((e, i) => {
          let value = extractDeepPropertyByMapKey(e, propertyName);
          value = isObject(value) ? JSON.stringify(value) : value;

          if (isUndefined(value) || uniques[value]) {
            return false;
          }

          uniques[value] = true;
          return true;
        })
      : input;
  }
}