import {ApiGroupData} from "@/api/Group/ApiGroupData";

export interface ApiGroupWithRightsDataData extends ApiGroupData {
    "rights": ("VIEW" | "COMMENT" | "APPROVAL" | "DOWNLOAD" | "MODIFY" | "SHARE" | "DELETE")[],
}
