import { SpcialSyntaxError } from "./lib/SpcialSyntaxError.ts"

export { Spcial }

class Spcial 
{
    private static isEnclosedBy(input: string, index: number, char: string[]): boolean 
    {
        // TODO: escaped, char in string
        if ((input.substring(0, index).match(new RegExp("(?<!\/)" + char[0], "g")) || []).length
        == (input.substring(index, input.length).match(new RegExp("(?<!\/)" + char[1], "g")) || []).length) 
        {
            return true
        } 
        else 
        {
            return false
        }
    }

    private static stringifyObject(obj: object): string {
        return ""
    }

    private static evaluate(spcialValue: string, srcCode: string, line: string, lineNum: number): any 
    {
        if (spcialValue == "True") 
        {
            return true
        } 
        else if (spcialValue == "False") 
        {
            return false
        } 
        else if (spcialValue == "Nothing") 
        {
            return null
        } 
        else if (spcialValue == "@") 
        {
            let arr: any[] = []

            for (let child of this.getChildren(srcCode, line, lineNum).split("|")) 
            {
                if (child.trim().length > 0) 
                {
                    arr.push(this.evaluate(child.trim(), srcCode, line, lineNum))
                }
            }

            return arr
        } 
        else if (spcialValue == "$") 
        {

        } 
        else if (!Number.isNaN(Number(spcialValue))) 
        {
            return Number(spcialValue)
        } 
        else if (spcialValue[0] == "'" && spcialValue[spcialValue.length - 1] == "'") 
        {
            return spcialValue
        } 
        else if (spcialValue[0] == "[") 
        {

        } 
        else 
        {
            throw new SpcialSyntaxError(line, lineNum)
        }
    }

    private static getChildren(srcCode: string, line: string, lineNum: number) 
    {
        let child: string = ""
        let codeArray = srcCode.split('\n')
        
        for (let i = lineNum; i < codeArray.length; i++) 
        {
            if (codeArray[i].length - codeArray[i].trimStart().length 
                > 4 + line.length - line.trimStart().length)
                {
                child += codeArray[i]
            }
        }

        return child
    }

    private static parseChild(srcCode: string): object 
    {
        let obj = {}

        for (const [lineNum, line] of srcCode.split("\n").entries()) 
        {
            if (line.trim()[0] == "#" || line.trim()[0] == "|") 
            {
                continue
            } 
            else if (line.trim()[line.length - 1] == ":") 
            {
                if (line.includes("->")) 
                {
                    let sides = line.split("->")

                    for (let side of sides) 
                    {
                        if (side.match(/[^\w\d\s:]/g) != null)
                        {
                            throw new SpcialSyntaxError(line, lineNum)
                        }
                    }

                    obj[sides[0]][sides[1]].push(this.parseChild(this.getChildren(srcCode, line, lineNum)))
                } 
                else 
                {
                    if (line.match(/[^\w\d\s:]/g) != null) 
                    {
                        throw new SpcialSyntaxError(line, lineNum)
                    }

                    this.parseChild(this.getChildren(srcCode, line, lineNum))
                }
                
            } 
            else if (line.includes("=")) 
            {
                let key = line.split("=")[0]
                let rhs = line.replace(key, "").trim()

                for (let i = rhs.length - 1; i >= 0; i--) 
                {
                    if (rhs[i] == "'") 
                    {
                        break
                    } 
                    else if (rhs[i] == "#") 
                    {
                        rhs = rhs.substring(0, i).trim()
                    }
                }

                obj[key] = this.evaluate(rhs, srcCode, line, lineNum)
            }
            else 
            {
                throw new SpcialSyntaxError(line, lineNum)
            }
        }

        return obj
    }

    /**
     * Parses a SPCiaL string, outputting a JavaScript object 
     * @param spcialString SPCiaL string
     * @returns Native JS object
     */
    public static toObjectFromString(spcialString: string): object 
    {
        return this.parseChild(spcialString)
    }

    /**
     * Converts a Javascript object into a SPCiaL string
     * @param spcialObj JS object as input
     * @returns SPCiaL string
     */
    public static toSpcialString(spcialObj: object): string 
    {
        throw new Error("Not implemented yet")
    }
}