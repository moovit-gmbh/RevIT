import {Group} from "@/domain/Group/Group";

export interface GroupWithRights extends Group {
    "rights": ("VIEW" | "COMMENT" | "APPROVAL" | "DOWNLOAD" | "MODIFY" | "SHARE" | "DELETE")[],
}
