class WhereClause {
    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }

    search(){
        const searchWord = this.bigQ.search ? {
            name : {
                $regex: this.bigQ.search,
                $options: "i"
            }
        } : {}

        this.base = this.base.find({...searchWord})
        return this
    }

    pager(resultPerPage){
        let currentPage = 1
        if(this.bigQ.page){
            currentPage = this.bigQ.page
        }

        const skipNo = resultPerPage * (currentPage - 1);
        this.base = this.base.limit(resultPerPage).skip(skipNo)
        return this
    }

    filter(){
        const copyQ = { ...this.bigQ }

        delete copyQ["search"]
        delete copyQ["page"]
        delete copyQ["limit"]

        let stringOfCopyQ = JSON.stringify(copyQ)

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte | lte | gt | lt)\b/g, (m) => `$${m}`)

        const jsonofCopyQ = JSON.parse(stringOfCopyQ)

        this.base = this.base.find(jsonofCopyQ)
        return this;
    }
}

module.exports = WhereClause