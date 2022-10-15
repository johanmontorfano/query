import Crypto from "@johanmnto/crypto";
import { QueryTokens, ValueTokens } from "./config/tokens";

/** create a query string for a specific use-case */
export namespace QueryString {
    /** create a query-string which compares a value with a remote value */
    export namespace New {
        export function isEqual(value: any) {
            return QueryString.Tools.buildQS(value, QueryTokens.Equality, QueryTokens.RemoteValue)
        }
        /** is the value pushed in the function lower than the remote value */
        export function isLower(value: any) {
            return QueryString.Tools.buildQS(value, QueryTokens.Lowerness, QueryTokens.RemoteValue)
        }
        /** is the value pushed in the function higher than the remote value */
        export function isHigher(value: any) {
            return QueryString.Tools.buildQS(value, QueryTokens.Higherness, QueryTokens.RemoteValue)
        }
    }
    export namespace Tools {
        /** check if a `querystring` is really a query string */
        export function isQueryString(qs: string) {
            return qs.startsWith(QueryTokens.QueryStringSignature);
        }
        /** returns the appropriate token value for the value to compare */
        export function getValueToken(value: any) {
            if (typeof value === "number" || typeof value === "bigint") return ValueTokens.Number;
            if (typeof value === "string") return ValueTokens.String;
            if (typeof value === "object") return ValueTokens.Object;
            if (typeof value === "boolean") return ValueTokens.Boolean;
        }
        /** build a query string */
        export function buildQS(value: any, comparison: string, target: string) {
            return `${QueryTokens.QueryStringSignature}${QueryString.Tools.getValueToken(value)}->${Crypto.encode(value)}${comparison}${target}`;
        }
        /** parse a query string */
        export function parseQS(qs: string) {
            const parsedData: {value: any, method: string, target: string} = {
                value: "",
                method: "",
                target: ""
            }

            /** determines what comparison is wanted in this querystring */
            if (qs.indexOf(QueryTokens.Equality) !== -1) parsedData.method = QueryTokens.Equality
            else if (qs.indexOf(QueryTokens.Higherness) !== -1) parsedData.method = QueryTokens.Higherness
            else if (qs.indexOf(QueryTokens.Lowerness) !== -1) parsedData.method = QueryTokens.Lowerness
            else throw Error("No comparison token found in query-string: " + qs);

            /** value package to parse */
            const valuePackage = (qs.split(parsedData.method[0]) as string[])[0].split("->");
            valuePackage[1] = atob(valuePackage[1])
            /** determines and parses the value to compare */
            if(valuePackage[0] === ValueTokens.Boolean) parsedData.value = valuePackage[1] === "true"
            else if(valuePackage[0] === ValueTokens.Number) parsedData.value = parseInt(valuePackage[1])
            else if(valuePackage[0] === ValueTokens.Object) parsedData.value = JSON.parse(valuePackage[1])
            else if(valuePackage[0] === ValueTokens.String) parsedData.value = valuePackage[1]
            else throw Error("Failed to parse the value to be used: " + qs);

            /** determines the value to compare */
            parsedData.target = qs.split(parsedData.method)[1];

            return parsedData;
        }
    }
}